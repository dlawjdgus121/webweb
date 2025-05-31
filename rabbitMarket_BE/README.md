# 토끼장터 -RabbitMarket

 <p align="center"><img width="500"  alt="스크린샷 2021-12-09 오후 2 32 42" src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F4c860e78-845e-4de6-a75c-56107f93c6d8%2Flogo2.png?table=block&id=17ff16d8-92c5-4f32-810e-0d41a39b19de&spaceId=c4a58787-6451-44b1-a89e-57209eda852b&width=1540&userId=34989c27-d849-4879-b2e6-1b274dcc5108&cache=v2">
 </p>

</br>

## 🤷 프로젝트 소개

### 토끼처럼 빠른 거래!
<p>
당신 근처의 토끼마켓
 중고 거래부터 나눔 정보까지, 모두와 함께해요.<br>
신속 정확한 거래를 해보아요.
</p>

### :arrow_down: Click!
[![5조 토끼장터 웹사이트](https://user-images.githubusercontent.com/82128525/154483293-18ee1142-2ca8-4b48-abfd-ba73791078a4.gif)](http://hanghae99-rabbitmarket.s3-website.ap-northeast-2.amazonaws.com/) 
</br>

<br><br>


## 🎥 시연 영상

### :arrow_down: Click!

 [![5조 토끼장터 시연영상](http://img.youtube.com/vi/iQ80Nb2BXTo/0.jpg)](https://youtu.be/iQ80Nb2BXTo) 
<br><br>

## 🧑🏼 개발기간 및 팀원소개

### 기간: 2022.02.11 ~ 2022.02.17

</br>

### Back-end

<p><a href="https://github.com/daonez"><img width="180"  src="https://img.shields.io/static/v1?label=Node.js&message=Francisco Choi&color=08CE5D&style=for-the-badge&>"/></a></p>
<p><a href="https://github.com/Sinclebear"><img width="180"  src="https://img.shields.io/static/v1?label=Node.js&message=Sanghyuk Jin&color=08CE5D&style=for-the-badge&>"/></a></p>
<p><a href="https://github.com/bgg01555"><img width="180"  src="https://img.shields.io/static/v1?label=Node.js&message=Juhyeon Yu&color=08CE5D&style=for-the-badge&>"/></a></p>

### Front-end

<p><a href="https://github.com/clappingmin"><img width="180"  src="https://img.shields.io/static/v1?label=React&message=Sumin Park&color=61dafb&style=for-the-badge&>"/></a></p>
<p><a href="https://github.com/Junparkk"><img width="180"  src="https://img.shields.io/static/v1?label=React&message=HyoJun Park&color=61dafb&style=for-the-badge&>"/></a></p>


### Front-end Repo


<p><a href="https://github.com/clappingmin/rabbitMarket_FE"><img width="180"  src="https://img.shields.io/static/v1?label=RabbitMarket&message=FrontEnd Repo&color=61dafb&style=for-the-badge&>"/></a></p>

### Notion

<p><a href="https://www.notion.so/17ff16d892c54f32810e0d41a39b19de"><img width="180"  src="https://img.shields.io/static/v1?label=Notion&message=Team Notion&color=08CE5D&style=for-the-badge&>"/></a></p>
<br>
<br>

## 🔨사용한 기술 스택


### 🖥 Back-End 기술스택

|   이름   |        설명        |
| :------: | :----------------: |
| Node.js  | Javascript Runtime |
| Express  |   Web Framework    |
|  MongoDB |      Database      |


<br><br>

## 📒 라이브러리

|        name        |       Appliance       | version  |
| :----------------: | :-------------------: | :------: |
|      aws-sdk       |        S3 bucket 접근        | 2.1073.0 |
|   bcrypt    |   encrypt    |  5.0.1   |
|        cors        | Request resource 제한 |  2.8.5   |
|       dotenv       |     환경변수 설정     |  16.0.0  |
|       joi       |   validator     |  17.6.0   |
|  jsonwebtoken   |  유저 인증   |  8.5.1   |
| mongoose |    Model Schema     |  6.2.1   |
|       multer       |  이미지 데이터 처리   |  1.4.4   |
|     multer-S3      |   사진 파일 업로드    |  2.10.0  |
| nodemon|     server monitor restarter       |  2.0.15   |
|  s3   |   AWS bucket   |  2.0.0  |


<br><br>

## :golf: Deploy

|Deploy|
|-|
| EC2   |   
| AWS S3|


<br><br>

## :scroll: Wire Frame
<img width="789" alt="Untitled" src="https://user-images.githubusercontent.com/63644481/154420216-4b7db265-7f8f-43f6-8fdc-ee878c5dd258.png">

<br><br>

## :wrench: DB Schema
<img width="355" alt="캡처" src="https://user-images.githubusercontent.com/63644481/154421645-f724c2fb-f281-4e53-9398-33d469cd8091.PNG">

<br><br>

## :closed_book: API

|기능               |Method|URL                   |request                                                                                                                          |response                                                                                                                                                                                                                                                                                                                                                                                        |
|-----------------|------|----------------------|---------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|회원가입 하기          |POST  |/api/signup           |{  loginId:String password:String nickname:String }                                                                              |{ ok:Boolean result: String }                                                                                                                                                                                                                                                                                                                                                                   |
|아이디 중복 체크        |POST  |/api/checkid          |{  loginId:String }                                                                                                              |{  ok:Boolean }                                                                                                                                                                                                                                                                                                                                                                                 |
|로그인하기            |POST  |/api/login            |{ loginId:String password:String }                                                                                               |{ token :String } OR {   ok:false   result:String }                                                                                                                                                                                                                                                                                                                                             |
|로그인 상태 체크        |GET   |/api/checklogin       |headers: {  Authorization : `Bearer %token%` }                                                                                   |{   user: {     userId: String,     nickname: String   } }                                                                                                                                                                                                                                                                                                                                      |
|전체 상품 조회         |GET   |/api/posts            |{}                                                                                          |{ ok:true(Boolean), <br> posts: <br> {postId: String, title: string, <br> content:String, price:Number, <br> imgurl : string, createdAt:string,<br> updatedAt:string, nickname:string, <br>userId:String, isSold:Boolean, <br>comments_cnt:number }[] }  ||  | |   |
|상세페이지 상품 조회|GET |/api/posts/:postId    |  |{ ok:true(Boolean),<br> post: <br> {title: string, price:Number, <br>content:String, imgurl : string, <br>createdAt:string, updatedAt:string, <br>userId:string, nickname:string,<br>  isSold:Boolean} }<br> comments:    <br> {commentId:String,     comment:String,   <br>  postId:String,     nickname:String,  <br>   userId:String,     createdAt:String,  <br>   updatedAt:String, } [] <br> OR { ok:false(Boolean), post: {} comments:{} }|
|판매상품 등록          |POST  |/api/posts            | headers: {  Authorization : `Bearer %token%` } body: { title:String price:String imgurl:String content:String }                  |  {   ok:true,  <br> result:”판매 상품이 등록되었습니다.” } <br> {   ok: false,   result: '올바른 입력이 아닙니다.'  }                                                                                                                                                                                                                                                                                                          |
|판매상품 이미지 업로드     |POST  |/api/image            |headers: {  Authorization : `Bearer %token%` } {   file:image }                                                                  |{   ok:true,   result:”이미지 업로드 완료”,   imgurl:String }                                                                                                                                                                                                                                                                                                                                           |
|판매상품 수정          |PUT   |/api/posts            |headers: {  Authorization : `Bearer %token%` } body: { postId:String title:String, price:String, imgurl:String, content:String, }|{   ok:true,   result:”판매 상품이 수정되었습니다.” }                                                                                                                                                                                                                                                                                                                                                       |
|판매상품 삭제          |DELETE|/api/posts            |headers: {  Authorization : `Bearer %token%` } body:{ postId: String }                                                           |{   ok:true,   result:”판매 상품이 삭제되었습니다.” } <br> or {   ok:false,   result:”삭제 권한이 없습니다.” }                                                                                                                                                                                                                                                                                                            |
|댓글 작성하기          |POST  |/api/comments         |headers: {  Authorization : `Bearer %token%` } body:{ postId:String, comment:String }                                            |{   ok:true,   result: Object }                                                                                                                                                                                                                                                                                                                                                                 |
|댓글 수정하기          |PATCH |/api/comments         |headers: {  Authorization : `Bearer %token%` } body:{ commentId:String, comment, }                                               |{   ok:true,   result:”댓글이 수정되었습니다.” }                                                                                                                                                                                                                                                                                                                                                          |
|댓글 삭제하기          |DELETE|/api/comments         |headers: {  Authorization : `Bearer %token%` } body:{ commentId:String }                                                         |{   ok:true,   result:”댓글이 삭제되었습니다.” }                                                                                                                                                                                                                                                                                                                                                          |
|상세페이지 판매 상태 수정   |PATCH |/api/status           |headers: {  Authorization : `Bearer %token%` } body:{   postId:String }                                                          |{ ok:true, result:”판매중/거래완료로 변경되었습니다.” }                                                                                                                                                                                                                                                                                                                                                        |
|상품 검색            |GET   |/api/search?title=에어팟 |body{ title }                                                                                                                    |{ ok:true, <br> result: <br> posts: {postId: String, title: string,  <br> content:String, price:Number, <br> imgurl : string, createdAt:string,<br>  updatedAt:string, nickname:string,<br>  userId:String, isSold:Boolean, <br> comments_cnt:number }[] }                                                                                                                                                                        |
|판매중/판매완료 분류해서 보이기|GET   |/api/sales?isSold=true|                                                                                                                                 |{ ok:true,<br>  result:<br>  posts: {postId: String, title: string,  content:String,<br>  price:Number,  imgurl : string, createdAt:string, updatedAt:string, nickname:string, userId:String, isSold:Boolean, comments_cnt:number }[] }                                                                                                                                                                        |

<br><br>

## :hammer: Trouble Shooting

