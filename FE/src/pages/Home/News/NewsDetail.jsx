import "./NewsDetail.css";
import { useParams,useNavigate } from "react-router-dom";
import newsData from "./datanews";

const NewsDetail = () => {

const { id } = useParams();
const navigate = useNavigate();

const article = newsData.find(n => n.id === Number(id));

if(!article){
return <div className="news-detail">Không tìm thấy bài báo</div>
}

return(

<div className="news-detail">

<button
className="back-btn"
onClick={()=>navigate(-1)}
>
← Quay lại
</button>

<h1 className="news-title">
{article.title}
</h1>

<div className="news-date">
{article.date}
</div>

<img
className="news-image"
src={article.image}
alt={article.title}
/>

<p className="news-desc">
{article.desc}
</p>

<div className="news-content">
{article.content.split("\n").map((p,i)=>(
<p key={i}>{p}</p>
))}
</div>

</div>

)

}

export default NewsDetail;