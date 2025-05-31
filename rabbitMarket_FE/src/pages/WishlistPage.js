import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'; // ✅ 추가

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem('login-token');
  const history = useHistory(); // ✅ 추가

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setWishlist(res.data.wishlist);
      })
      .catch((err) => {
        console.error('찜 목록 불러오기 실패:', err.response ? err.response.data : err.message);
      });
  }, [token]);

  return (
    <div style={{ marginLeft: '220px', padding: '20px' }}>
      <h2>내 찜 목록</h2>
      {wishlist.length === 0 ? (
        <p>찜한 게시물이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {wishlist.map((post) => (
            <li
              key={post._id}
              onClick={() => history.push(`/post/${post._id}`)} // ✅ 클릭 시 이동
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <img src={post.imgurl} alt={post.title} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <p>{post.price}원</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishlistPage;
