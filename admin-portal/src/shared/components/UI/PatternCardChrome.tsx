const PatternCardChrome = () => (
  <>
    <div className="sovereign-pattern-card-shine" aria-hidden="true" />
    <div className="sovereign-pattern-card-background" aria-hidden="true">
      <div className="sovereign-pattern-card-tiles">
        {Array.from({ length: 10 }, (_, index) => (
          <div
            key={index}
            className={`sovereign-pattern-card-tile sovereign-pattern-card-tile-${index + 1}`}
          />
        ))}
      </div>
      <div className="sovereign-pattern-card-line sovereign-pattern-card-line-1" />
      <div className="sovereign-pattern-card-line sovereign-pattern-card-line-2" />
      <div className="sovereign-pattern-card-line sovereign-pattern-card-line-3" />
    </div>
  </>
);

export default PatternCardChrome;
