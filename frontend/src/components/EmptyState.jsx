export default function EmptyState({ icon = '🏠', title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p style={{marginBottom:20}}>{description}</p>}
      {action}
    </div>
  );
}
