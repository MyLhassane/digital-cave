# js/sections-main.js — وحدة الأقسام الفرعية

## ما هو هذا الملف؟

هذه **وحدة الدخول** لصفحة `sections.html`. كانت سابقًا 185 سطرًا من الكود المضمّن (inline) داخل HTML، والآن أصبحت وحدة ES نظيفة تستورد من 5 وحدات مشتركة.

---

## الاستيرادات

```javascript
import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveTunnel, createCaveMaterial } from "./geometry.js";
import { startAnimationLoop } from "./animate.js";
import { bindMovementControls, bindSelectionControls } from "./controls.js";
import { startFadeAndRedirect } from "./ui.js";
```

تستورد فقط ما تحتاجه — لا `config.js` (لأن الأقسام لا تحتاج للإعدادات العامة)، ولا `ui.js` بالكامل (فقط `startFadeAndRedirect`).

---

## تدفق العمل

### 1. قراءة المجال المعرفي

```javascript
const domainId = urlParams.get("domain") || "natural";
```

### 2. تحديد الأقسام الفرعية

مصفوفة تحتوي على 3-4 أقسام حسب المجال (طبيعي، اجتماعي، شكلي).

### 3. بناء المشهد والكهف

```javascript
const { scene, camera, renderer, headlight } = createSceneContext();
const caveMaterial = createCaveMaterial(0x120124, 0x440088);  // أرجواني داكن
const corridor = createCaveTunnel({
    radius: 300, length: totalLength, radialSegments: 24, heightSegments: 40,
    zOffset: -totalLength / 2 + 100, material: caveMaterial
});
```

- **نفق أضيق** (نصف قطر 300) لأن اللوحات أصغر.
- **طول ديناميكي**: `Math.max(2000, sections.length * 600)`.
- **ألوان أرجوانية** تميز هذه الصفحة.

### 4. إنشاء اللوحات

لكل قسم فرعي، لوحة Canvas 2D مع:
- إطار أرجواني (`#9d00ff`)
- خلفية متدرجة
- نص عربي

توضع بشكل متناوب (يمين/يسار) وبزاوية 45° لتوحي بأنها مداخل جانبية.

### 5. التفاعل

```javascript
bindMovementControls(state, bounds, () => {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    startFadeAndRedirect("index.html", 500);  // العودة للمدخل
});

bindSelectionControls({
    state, camera, interactiveTargets: interactivePortals,
    onTargetSelected: (target) => {
        state.isTransitioning = true;
        startFadeAndRedirect(target.userData.redirectUrl, 600);  // الذهاب للمقالات
    }
});
```

- **حركتان**: عجلة الفأرة واللمس.
- **خياران**: الرجوع للمدخل الرئيسي أو الدخول إلى قسم.

### 6. حلقة التحريك

```javascript
startAnimationLoop({ state, camera, headlight, renderer, scene });
```

لا `onFrameUpdate` — sections لا تحتاج تأثيرات إضافية في كل إطار.

---

## لماذا وحدة منفصلة؟

- **فصل الاهتمامات**: HTML يبقى نظيفًا، JS في ملف مستقل.
- **إعادة استخدام**: `scene.js`، `geometry.js`، `animate.js`، `controls.js` كلها مشتركة مع `index.html` و `posts.html`.
- **صيانة أسهل**: تغيير في سلوك الحركة → تعديل `controls.js` فقط.
