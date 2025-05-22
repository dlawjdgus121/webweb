import React from 'react';
import styled from 'styled-components';
import Grid from '../elements/Grid';
import Button from '../elements/Button';
import Input from '../elements/Input';
import Image from '../elements/Image';
import Text from '../elements/Text';

// 리액트 아이콘
import { BiSearchAlt2 } from 'react-icons/bi';
import { BsCoin } from 'react-icons/bs';

const Footer = () => {
  return (
    <FooterContainer className="main-footer">
      <div className="footer-middle">
        <div className="container">
          <div className="row">
            {/* column 1 */}
            <div className="col-md-3 col-sm-6">
              <ul className="list-unstyled">
                <li>
                  <div className="img_wrap">
                    <img
                      src="https://user-images.githubusercontent.com/82128525/154397763-76c59dc1-cbad-4d02-991a-5caceb6cba79.png"
                      alt=""
                    />
                  </div>
                </li>
              </ul>
            </div>
            {/* column 2 */}
            <div className="col-md-3 col-sm-6">
              <h4>항해99</h4>
              <ul className="list-unstyled">
                <li>미니프로젝트</li>
                <li>5조</li>
              </ul>
            </div>
            {/* column 3 */}
            <div className="col-md-3 col-sm-6">
              <h4>FB</h4>
              <ul className="list-unstyled">
                <li>박수민</li>
                <li>박효준</li>
              </ul>
            </div>
            {/* column 4 */}
            <div className="col-md-3 col-sm-6">
              <h4>BE</h4>
              <ul className="list-unstyled">
                <li>최창용</li>
                <li>진상혁</li>
                <li>유주현</li>
              </ul>
            </div>
          </div>
          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="text-xs-center">
              &copy;{new Date().getFullYear()} Rabbit Market - All Rights
            </p>
          </div>
        </div>
      </div>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  .footer-middle {
    background: #495057;
    padding-top: 3rem;
    text-align: center;
  }

  .footer-bottom {
    padding-top: 3rem;
    padding-bottom: 2rem;
  }
  .img_wrap {
    width: 10rem;
    height: 5rem;
  }
  li {
    color: white;
    display: flex;
    justify-content: center;
  }
  p {
    color: white;
  }
  h4 {
    color: white;
  }
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

export default Footer;
