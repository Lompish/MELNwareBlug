# Blug_client
Enbart frontend för projektet Blug.

## Setup

#### Steg 1
Öppna terminalen och gå in i client-mappen:
```bash
cd client
```

#### Steg 2
Installera alla dependencies:
```bash
npm install
```

### **Med dev**

#### Steg 3
Se till att din servern är igång, kör på port 3000 och att alla routes i servern börjar med "/api". Starta sedan client:
```bash
npm run dev
```

#### Extra
Vill du ändra proxy porten i clienten, gå in i /client/vite.config.js och ändra porten i proxy'n:
```js
proxy: {
      "/api": "http://localhost:3000"
    }
```

### **Med build**

#### Steg 3
Kör build processen:
```bash
npm run build
```
Nu kommer clienten byggas och lägga sig i mappen "/server/dist"

#### Steg 4
Gå in i din server och se till and express använder dist-mappen genom att lägga till:
```js
app.use(express.static("./dist"))
```

