FROM node:24-slim

WORKDIR /app

COPY . .

RUN npm install -g @angular/cli

# Desactiva la pregunta de analíticas de forma global (dentro del contenedor)
RUN ng config --global cli.analytics false

RUN npm install

EXPOSE 4200

# Comando correcto (sin --no-analytics)
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "500"]