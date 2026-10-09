import "./StatCard.css";

export default function StatCard({
  title,
  value,
  type,
  active,
  onClick
}){

  return(

    <div
      className={`statCard ${type} ${active ? "active" : ""}`}
      onClick={onClick}
    >

      <div className="statCard__title">
        {title}
      </div>

      <div className="statCard__value">
        {value}
      </div>

    </div>

  );

}