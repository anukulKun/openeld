const QUOTES = [
  {
    text: 'The truck doesn\u2019t care about your excuses \u2014 neither does the clock.',
    author: 'Trucker wisdom',
  },
  {
    text: 'Plan the drive, then drive the plan.',
    author: '',
  },
  {
    text: 'Every mile starts with a route. Fill in the details on the left to begin.',
    author: '',
  },
  {
    text: 'Compliance isn\u2019t the hard part. Knowing your hours before you\u2019re out of them is.',
    author: '',
  },
];

export default function TripEmptyState() {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="trip-empty-wrap">
      <div className="trip-empty-state">
        <div className="trip-empty-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M3 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="trip-empty-heading">No route planned yet</h2>
        <p className="trip-empty-quote">&ldquo;{quote.text}&rdquo;</p>
        {quote.author && <p className="trip-empty-author">&mdash; {quote.author}</p>}
        <p className="trip-empty-hint">Fill in the trip details on the left to get started.</p>
      </div>
    </div>
  );
}
