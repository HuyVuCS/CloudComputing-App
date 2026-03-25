# Customer Management SaaS (AWS)

## Setup & Run

## 1. Clone project
git clone https://github.com/HuyVuCS/CloudComputing-App.git
cd CloudComputing-App

## 2. Backend setup
cd backend
npm install

Tạo file .env:
```env
PORT=5000
DB_HOST=your-rds-endpoint
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=contact_management

JWT_SECRET=your_secret

AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```
Chạy backend:
node server.js

## 3. Frontend setup
cd ../frontend
npm install
npm run dev

## 4. Deploy trên EC2
- Cài Node.js, npm
- Clone repo về EC2
- Cấu hình .env như trên
- Cài PM2:
  npm install -g pm2
  pm2 start server.js
  pm2 save
  pm2 startup

## 5. Cấu hình Nginx
sudo nano /etc/nginx/sites-available/default

server {
    listen 80;
    location / {
        proxy_pass http://localhost:5000;
    }
}

sudo systemctl restart nginx

## 6. Database (RDS)
- Tạo MySQL trên RDS
- Mở port 3306 cho EC2 Security Group
- Import schema (tenants, users, customers)

## 7. Domain (tuỳ chọn)
- Trỏ DNS về EC2 IP hoặc ALB

## 8. Chạy hệ thống
Truy cập:
http://<EC2-IP hoặc domain>
