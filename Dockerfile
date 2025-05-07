# Sử dụng Node.js làm base image
FROM node:20

# Đặt thư mục làm thư mục làm việc chính
WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Biên dịch mã nguồn TypeScript sang JavaScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]
