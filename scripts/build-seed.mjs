import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));
const rows = catalog.products.map((product, index) => ({ ...product, image_url: null, active: true, sort_order: index + 1 }));
const json = JSON.stringify(rows);
const sql = `-- Chạy sau schema.sql. Chỉ thêm sản phẩm chưa tồn tại; không ghi đè những thay đổi trong trang quản trị.\ninsert into public.products (id,name,category,gender,style,price,sizes,image_url,color,accent,active,sort_order)\nselect id,name,category,gender,style,price,sizes,image_url,color,accent,active,sort_order\nfrom jsonb_to_recordset($catalog$${json}$catalog$::jsonb) as p(\n  id text,name text,category text,gender text,style text,price integer,sizes jsonb,\n  image_url text,color text,accent text,active boolean,sort_order integer\n)\non conflict (id) do nothing;\n`;
fs.writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log(`Generated seed.sql for ${rows.length} products.`);
