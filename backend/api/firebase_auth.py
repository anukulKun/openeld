import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


def _ensure_firebase_initialized():
    if firebase_admin._apps:
        return True
    project_id = settings.FIREBASE_PROJECT_ID
    private_key = settings.FIREBASE_PRIVATE_KEY
    client_email = settings.FIREBASE_CLIENT_EMAIL
    if not all([project_id, private_key, client_email]):
        return False
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": project_id,
        "private_key": private_key.replace("\\n", "\n"),
        "client_email": client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred)
    return True


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        id_token = auth_header.split('Bearer ')[1]
        if not _ensure_firebase_initialized():
            raise AuthenticationFailed('Firebase not configured (missing env vars)')

        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid Firebase token: {e}')

        from api.models import DriverProfile

        firebase_uid = decoded['uid']
        email = decoded.get('email', '')

        profile, created = DriverProfile.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={'email': email},
        )
        if not created and email and profile.email != email:
            profile.email = email
            profile.save(update_fields=['email'])

        request.firebase_user = {
            'firebase_uid': firebase_uid,
            'email': email,
            'profile': profile,
        }

        return (None, {'firebase_uid': firebase_uid})
