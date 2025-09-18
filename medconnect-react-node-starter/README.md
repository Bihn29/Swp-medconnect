# MedConnect — React + Node.js Starter

## Yêu cầu
- Docker & Docker Compose
- Node 20+ (nếu chạy thủ công)

## Chạy nhanh bằng Docker Compose
```bash
docker compose up
```
- API: http://localhost:4000/health
- Frontend: http://localhost:5173

### Lần đầu (nếu thiếu migration):
- Backend container sẽ tự `prisma generate` và `migrate`.
- Bạn có thể seed dữ liệu test:
```bash
docker exec -it $(docker ps -qf "name=backend") sh -c "npm run prisma:seed"
```

## Chạy thủ công (không Docker)
1. Khởi chạy Postgres local (DATABASE_URL trong `backend/.env`)
2. Backend:
```bash
cd backend
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
3. Frontend:
```bash
cd frontend
npm i
npm run dev
```

## Đăng nhập nhanh (sau khi seed)
- patient@medconnect.local / admin123
- doctor@medconnect.local / admin123

## Tiếp theo
- Thêm xác thực 2FA, Rate limiting, Lịch slot thực tế, Tích hợp Payment/Video thật (VNPAY / ZEGOCLOUD).
- Viết test (Vitest/Jest), CI/CD, triển khai môi trường staging.
