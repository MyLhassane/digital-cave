# js/geometry.js — دوال إنشاء الهندسة الكريستالية

## ما هو هذا الملف؟

هذا الملف يحتوي على دوال مسؤولة عن **توليد وتشويه** الأشكال الهندسية لخلق مظهر الكهف البلوري (الكريستالي). المفتاح هو **التحويل من أسطوانة عادية إلى سطح صخري/بلوري غير منتظم**.

---

## الدوال

### 1. `applyCrystallineDisplacement(geometry)`

هذه هي **الدالة الأساسية** التي تحوّل الأسطوانة الملساء إلى كهف بلوري.

**كيف تعمل؟**

```javascript
const rockNoise = Math.sin(z * 0.03) * 40 + Math.cos(angle * 6 + z * 0.01) * 25;
```

تأخذ كل نقطة (vertex) في الشكل الهندسي وتزيحها للخارج بناءً على:
- **`Math.sin(z * 0.03) * 40`** — تموج طويل بطول الكهف (40 وحدة أقصى إزاحة).
- **`Math.cos(angle * 6 + z * 0.01) * 25`** — تموج قصير حول المحيط (25 وحدة أقصى إزاحة).

هذا يخلق مظهرًا طبيعيًا غير منتظم يشبه جدران كهف حقيقي.

**تلوين القمم**:
```javascript
if (Math.abs(Math.sin(z * 0.04)) > 0.88) {
    colors.push(0.1, 0.3, 0.5);  // بلورة زرقاء لامعة
} else {
    colors.push(0.05, 0.08, 0.12);  // صخر داكن
}
```

بعض النقاط العشوائية تُلون بلون أزرق فاتح (بلورات متوهجة) والباقي بلون داكن.
في النهاية، تعيد الدالة حساب المتجهات الطبيعية (`computeVertexNormals`) لتصحيح الإضاءة على السطح غير المنتظم.

### 2. `createCaveMaterial(colorHex, emissiveHex)`

تنشئ مادة (Material) للكهف باستخدام:
- `vertexColors: true` — استخدام ألوان القمم المخصصة
- `flatShading: true` — تظليل مسطح (غير أملس) يبرز المظهر البلوري
- `side: THREE.DoubleSide` — العرض من الداخل (لأن الكاميرا داخل الكهف)

تقبل باراميترين اختياريين:
- `colorHex` — لون المادة الأساسي (الافتراضي: `0x01131a`)
- `emissiveHex` — لون التوهج الداخلي (الافتراضي: `0x004466`)

**لماذا؟** لأن `sections.html` تحتاج ألوانًا مختلفة (`0x120124`, `0x440088`) عن `index.html` و `posts.html`. بدل تكرار الدالة، صارت تقبل باراميترات.

### 3. `createCaveTunnel({ radius, length, radialSegments, heightSegments, zOffset, material })`

دالة عامة لإنشاء **أي نفق كهفي** بقيم مرنة:

```javascript
export function createCaveTunnel({ radius, length, radialSegments, heightSegments, zOffset, material }) {
    const geo = new THREE.CylinderGeometry(radius, radius, length, radialSegments, heightSegments, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, zOffset);
    applyCrystallineDisplacement(geo);
    return new THREE.Mesh(geo, material);
}
```

هذه الدالة تحل محل ثلاثة تنفيذات مختلفة كانت موجودة سابقًا في `main.js`، `sections.html`، و `posts.html`. تستخدمها الآن جميع الصفحات بقيم مختلفة:

| الاستخدام | radius | length | segments | zOffset |
|-----------|--------|--------|----------|---------|
| المدخل الرئيسي | 400 | 3500 | 24×60 | -1600 |
| ممر الأقسام | 300 | متغير | 24×40 | `-length/2 + 100` |
| كهف المقالات | 400 | 5200 | 20×60 | `-length/2 + 200` |

### 4. `createMainTunnelMesh(material)`

**للتواءق مع الإصدارات السابقة فقط.** تستخدم `createCaveTunnel` داخليًا بقيم المدخل الرئيسي. ما زالت `main.js` تستخدمها.

### 5. `createBranchMesh(cfg, material)`

تنشئ فرعًا جانبيًا:
- أسطوانة أقصر (بطول 1200) وأضيق (نصف قطر 150).
- توضع في موقع `cfg.zFork` وتُدار بزاوية `cfg.angle`.
- تُزاح إلى الخلف بمقدار `(branchLength/2) + 280` لتتصل بالجدار الرئيسي.

---

## لماذا هذه الدوال مهمة؟

بدونها، كان الكهف سيبدو كمجرد أسطوانة ملساء مملة. التشويه البلوري هو **الخدعة البصرية** التي تجعل التجربة غامرة وتبعث على الدهشة.
