function UseCaseCard({ category, title, description }) {
    return (
      <div className={`use-case-card`} data-category={category}>
        <div className="use-case-content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    );
  }
  
  export default UseCaseCard;