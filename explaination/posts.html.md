# posts.html — المواضيع والمقالات

## موقعه في المشروع

هذه هي **الصفحة الثالثة والأخيرة** في رحلة المستخدم. بعد اختيار مجال معرفي ثم قسم فرعي، يدخل المستخدم إلى كهف عميق يعرض 10 لوحات مقالية بترتيب متعرج.

---

## هيكل الصفحة

`index.html` ← `sections.html` ← **`posts.html`**

```
posts.html                        # HTML هيكل بسيط (18 سطرًا)
    └── js/posts-main.js          # منطق الصفحة (وحدة ES)
            ├── scene.js          # إنشاء المشهد والإضاءة
            ├── geometry.js       # createCaveTunnel + createCaveMaterial
            ├── animate.js        # حلقة التحريك + onFrameUpdate
            ├── controls.js       # حركة اللمس/الفأر
            └── ui.js             # startFadeAndRedirect
```

**هذه الصفحة هي الأكثر تعقيدًا من حيث التأثيرات البصرية.** تستخدم `onFrameUpdate` في حلقة التحريك لتشغيل تأثيرات خاصة كل إطار.

---

## كيف تعمل `posts-main.js`؟

### 1. قراءة المعاملات

```javascript
const domainId = urlParams.get("domain") || "natural";
```

### 2. بناء كهف أوسع — عبر `createCaveTunnel`

```javascript
const caveMaterial = createCaveMaterial(0x01131a, 0x004466);
const cave = createCaveTunnel({
    radius: 400, length: caveLength, radialSegments: 20, heightSegments: 60,
    zOffset: -caveLength / 2 + 200, material: caveMaterial
});
```

- **أوسع وأطول** من بقية الكهوف (نصف قطر 400، طول 5200).
- **تقسيمات أقل** حول المحيط (20 قطعة) لتقليل الحمل مع الحفاظ على المظهر البلوري.

### 3. المقالات (اللوحات)

يوجد 10 لوحات مقالية:
- تُرسم على **Canvas 2D** (512×680 بكسل) مع عنوان عربي ونص وصفي يُوزّع تلقائيًا عبر الأسطر.
- تناوب المواضع (يمين/يسار) بتباعد 320 وحدة.
- مجموعة في `THREE.Group` لسهولة الإدارة.

### 4. التأثيرات الخاصة — عبر `onFrameUpdate`

`animate.js` تستدعي `onFrameUpdate` في كل إطار، مما يسمح لـ `posts-main.js` بتشغيل تأثيرات مستمرة:

#### أ. تغيير ألوان الجدران (Color Interpolation)

```javascript
let colorProgress = Math.abs(state.currentZ) / (panelSpacing * 3);
let currentFloor = Math.floor(colorProgress) % wallBaseColors.length;
let currentCeil = (currentFloor + 1) % wallBaseColors.length;
caveMaterial.color.copy(wallBaseColors[currentFloor])
    .lerp(wallBaseColors[currentCeil], blendFactor);
```

4 ألوان أساسية محددة مسبقًا تنتقل بينها الجدران بسلاسة عبر `lerp`. لون الضباب يتغير أيضًا ليطابق الجدران.

#### ب. تأثيرات اللوحات حسب المسافة

لكل لوحة، يُحسب `relativeZ = panel.z - state.currentZ`:
- **إخفاء**: لوحات بعيدة جدًا (< -2400) أو خلف الكاميرا (> 130) → `visible = false`.
- **شفافية متغيرة**: تتلاشى عند الاقتراب الشديد أو الابتعاد.
- **دوران تدريجي**: اللوحات تدور لتواجه الكاميرا عندما يقترب المستخدم منها.

### 5. العودة

`bindMovementControls(state, bounds, onExceedMax)` ← عند تجاوز الحد الخلفي، توجيه إلى `sections.html?domain=...`.

### 6. حلقة التحريك — بدون تعقيد إضافي

```javascript
startAnimationLoop({
    state, camera, headlight, renderer, scene,
    onFrameUpdate: () => { /* كل التأثيرات الخاصة */ }
});
```

`posts-main.js` لا تعيد كتابة حلقة التحريك. تستخدم `startAnimationLoop` مع `onFrameUpdate` لإضافة منطقها الخاص.

---

## ما الذي تغير؟

| قبل | بعد |
|-----|-----|
| 219 سطرًا HTML + JS مضمّن | 18 سطرًا HTML + وحدة JS منفصلة |
| كامل الكود مكرر من الصفحات الأخرى | استخدام `scene.js`، `animate.js`، `controls.js`، `geometry.js` |
| CSS مضمّن في `<style>` | استخدام `styles/main.css` المشترك |

---

## الخلاصة

هذه الصفحة تمثل **محور المحتوى** في المشروع. كل التأثيرات المتقدمة (تغيير ألوان الجدران، شفافية اللوحات، الدوران) تُحقّق عبر `onFrameUpdate` دون الحاجة لتعديل حلقة التحريك الأساسية. هذا يثبت قوة التصميم المعياري: دورة أساسية بسيطة + إضافات عبر callbacks.
