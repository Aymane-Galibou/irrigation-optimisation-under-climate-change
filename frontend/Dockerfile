FROM node:26-alpine3.23

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY . .

# 1. Build the Next.js app for production
RUN npm run build

EXPOSE 3000

# 2. Start the production server
CMD ["npm", "run", "start"]