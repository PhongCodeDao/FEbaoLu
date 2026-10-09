import "./NewsPage.css";
import { useNavigate } from "react-router-dom";
import newsData from "./datanews";

const NewsPage = () => {
  const navigate = useNavigate();

  const featured = newsData[0];

  return (
    <div className="news-page">
      {/* FEATURED */}

      <div
        className="news-featured"
        onClick={() => navigate(`/news/${featured.id}`)}
      >
        <img src={featured.image} alt="news" />

        <div className="featured-overlay">
          <h1>{featured.title}</h1>

          <p>{featured.desc}</p>

          <span>{featured.date}</span>
        </div>
      </div>

      {/* GRID */}

      <div className="news-grid">
        {newsData.slice(1).map((news) => (
          <div
            key={news.id}
            className="news-card"
            onClick={() => navigate(`/news/${news.id}`)}
          >
            <img src={news.image} alt={news.title} />

            <div className="news-card-content">
              <h3>{news.title}</h3>

              <p>{news.desc}</p>

              <span>{news.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
