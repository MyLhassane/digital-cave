# sections.html — الأقسام الفرعية

## موقعه في المشروع

هذه هي **الصفحة الثانية** في رحلة المستخدم. بعد أن يختار مجالًا معرفيًا (طبيعي، اجتماعي، شكلي) من الكهف الرئيسي، يدخل إلى ممر جانبي يعرض الأقسام الفرعية لذلك المجال.

---

## هيكل الصفحة

`index.html` ← **`sections.html`** ← `posts.html`

```
sections.html                    # HTML هيكل بسيط (18 سطرًا)
    └── js/sections-main.js      # منطق الصفحة (وحدة ES)
            ├── scene.js         # إنشاء المشهد والإضاءة
            ├── geometry.js      # createCaveTunnel + createCaveMaterial
            ├── animate.js       # حلقة التحريك
            ├── controls.js      # حركة اللمس/الفأر + النقر
            └── ui.js            # startFadeAndRedirect
```

لم يعد `sections.html` يحتوي على أي كود JavaScript مضمّن (inline). كل المنطق في **وحدة منفصلة** تستخدم الوحدات المشتركة مع بقية الصفحات.

---

## كيف تعمل `sections-main.js`؟

### 1. قراءة المعامل من الرابط

```javascript
const domainId = urlParams.get("domain") || "natural";
```

### 2. قاعدة بيانات الأقسام الفرعية

```javascript
const subSectionsDatabase = {
    natural: ["الفيزياء الكونية", "الكيمياء العضوية", "العلوم الحياتية", "جيولوجيا الأرض"],
    social: ["علم النفس السلوكي", "علم الاجتماع البنيوي", "الاقتصاد السياسي"],
    formal: ["الرياضيات البحتة", "المنطق الرياضي", "هندسة البرمجيات"]
};
```

### 3. بناء المشهد — باستخدام الوحدات المشتركة

```javascript
const { scene, camera, renderer, headlight } = createSceneContext();  // scene.js
const caveMaterial = createCaveMaterial(0x120124, 0x440088);          // geometry.js
const corridor = createCaveTunnel({                                   // geometry.js
    radius: 300, length: totalLength, radialSegments: 24, heightSegments: 40,
    zOffset: -totalLength / 2 + 100, material: caveMaterial
});
```

- **ألوان مختلفة** عن الصفحات الأخرى: `0x120124` أساسي + `0x440088` توهج أرجواني.
- **نفق أضيق** (نصف قطر 300) ليناسب اللوحات الأصغر.
- **طول ديناميكي** يعتمد على `Math.max(2000, currentSections.length * 600)`.

### 4. اللوحات التفاعلية (Portals)

لكل قسم فرعي، تُنشأ لوحة مستطيلة برسم Canvas 2D:
- نص عربي متوهج، خلفية متدرجة، إطار أرجواني (`#9d00ff`).
- توضع بشكل متناوب (يمين/يسار) بزاوية 45°.
- تخزن `redirectUrl` للنقر → `posts.html?domain=...&section=...`.

### 5. التفاعل

- **الحركة**: `bindMovementControls(state, bounds, onExceedMax)` ← عند تجاوز الحد، توجيه إلى `index.html`.
- **الاختيار**: `bindSelectionControls(...)` ← Raycaster يلتقط النقر على اللوحات.
- **الحلقة**: `startAnimationLoop({ state, camera, headlight, renderer, scene })` ← بدون `onFrameUpdate` لأن sections لا تحتاج تأثيرات خاصة.

---

## ما الذي تغير؟

| قبل | بعد |
|-----|-----|
| 185 سطرًا HTML + JS مضمّن | 18 سطرًا HTML + وحدة JS منفصلة |
| كود متكرر (scene, animate, controls) | استخدام الوحدات المشتركة مع index.html |
| CSS مضمّن في `<style>` | استخدام `styles/main.css` المشترك |
