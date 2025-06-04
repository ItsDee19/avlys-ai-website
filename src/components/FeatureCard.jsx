function FeatureCard({ title, description, icon }) {
  return (
    <div className="feature-card">
      {icon && (
        <div className="feature-icon">
          <span className="icon">{icon}</span>
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default FeatureCard; 