const fs = require('fs');
const p = 'C:/Users/danie/Desktop/ProyectoPGC/Proyecto/Del-Campo-a-tu-Hogar/frontend/src/pages/Profile.tsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace("item.products?.name || 'Producto'", "item.products?.name || 'Producto eliminado'");
fs.writeFileSync(p, s, 'utf8');
console.log('done');
