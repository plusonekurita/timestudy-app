import "./DashboardCard.scss";

export const DashboardCard = ({ title, icon: Icon, onClick }) => {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="card-content">
        <div className="card-icon">
          <Icon />
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
    </div>
  );
};
