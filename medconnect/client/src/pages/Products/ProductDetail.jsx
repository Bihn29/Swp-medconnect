import { useParams } from "react-router-dom";
import "./Products.scss";

const ProductDetail = () => {
  const { id } = useParams();
  return (
    <div className="product-detail-page">
      <h1>Product Detail</h1>
      <p>Chi tiết sản phẩm: {id}</p>
    </div>
  );
};

export default ProductDetail;


