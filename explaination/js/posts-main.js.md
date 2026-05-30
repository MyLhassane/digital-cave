# js/posts-main.js — وحدة المقالات

## ما هو هذا الملف؟

هذه **وحدة الدخول** لصفحة `posts.html`، وهي الصفحة الأكثر تعقيدًا في المشروع. تحتوي على:

- إنشاء كهف واسع بـ 10 لوحات مقالية
- تأثيرات بصرية متقدمة عبر `onFrameUpdate`
- تغيير ألوان الجدران والضباب تدريجيًا
- تحكم دقيق في شفافية ودوران كل لوحة

كانت سابقًا 219 سطرًا من الكود المضمّن داخل HTML.

---

## الاستيرادات

```javascript
import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveTunnel, createCaveMaterial } from "./geometry.js";
import { startAnimationLoop } from "./animate.js";
import { bindMovementControls } from "./controls.js";
import { startFadeAndRedirect } from "./ui.js";
```

لا تستورد `bindSelectionControls` لأن المقالات غير قابلة للنقر.

---

## تدفق العمل

### 1. قراءة المجال

```javascript
const domainId = urlParams.get("domain") || "natural";
```

### 2. بناء كهف مخصص

```javascript
const totalPanels = 10;
const panelSpacing = 320;
const caveLength = (totalPanels * panelSpacing) + 2000;

const caveMaterial = createCaveMaterial(0x01131a, 0x004466);
const cave = createCaveTunnel({
    radius: 400, length: caveLength,
    radialSegments: 20, heightSegments: 60,
    zOffset: -caveLength / 2 + 200, material: caveMaterial
});
```

- **طويل جدًا**: 5200 وحدة لاستيعاب 10 لوحات متباعدة.
- **تقسيمات أقل**: 20 قطعة حول المحيط لتحسين الأداء.

### 3. لوحات المقالات

10 لوحات (512×680 بكسل) ترسم على Canvas 2D:
- عنوان عربي بخط عريض 34px
- نص وصفي يُوزّع ديناميكيًا عبر الأسطر مع التفاف تلقائي
- خلفية متدرجة + إطار متوهج سماوي

توضع في مجموعة `THREE.Group` وتخزّن في مصفوفة `panelsData` مع موقعها واتجاهها.

### 4. التأثيرات المستمرة — `onFrameUpdate`

هذا هو **قلب `posts-main.js`**:

```javascript
startAnimationLoop({
    state, camera, headlight, renderer, scene,
    onFrameUpdate: () => {
        // 1. تغيير ألوان الجدران كلما تعمق المستخدم
        let colorProgress = Math.abs(state.currentZ) / (panelSpacing * 3);
        let currentFloor = Math.floor(colorProgress) % wallBaseColors.length;
        let currentCeil = (currentFloor + 1) % wallBaseColors.length;
        let blendFactor = colorProgress % 1;
        caveMaterial.color.copy(wallBaseColors[currentFloor])
            .lerp(wallBaseColors[currentCeil], blendFactor);
        caveMaterial.emissive.copy(wallEmissiveColors[currentFloor])
            .lerp(wallEmissiveColors[currentCeil], blendFactor);
        scene.fog.color.copy(caveMaterial.color);

        // 2. تحديث كل لوحة حسب موقعها
        panelsData.forEach(panel => {
            let relativeZ = panel.z - state.currentZ;
            // إخفاء / إظهار ، شفافية ، دوران
            ...
        });
    }
});
```

#### ألوان الجدران الأربعة

| المرحلة | اللون الأساسي | لون التوهج | الوصف |
|---------|--------------|------------|-------|
| 1 | `#020a14` | `#004477` | أزرق داكن |
| 2 | `#120124` | `#440088` | أرجواني |
| 3 | `#01140a` | `#005522` | أخضر داكن |
| 4 | `#1a020b` | `#660022` | أحمر داكن |

تنتقل بينها باستخدام `lerp` مع `blendFactor` من 0 إلى 1.

#### معالجة كل لوحة

لكل لوحة، `relativeZ = panel.z - currentZ` يحدد:
- **`relativeZ > 130`**: اللوحة خلف الكاميرا → `visible = false`
- **`relativeZ < -2400`**: اللوحة بعيدة جدًا → `visible = false`
- **`relativeZ > -400`**: الاقتراب → شفافية تتناقص (fade out قرب الكاميرا)
- **`relativeZ < -1600`**: الابتعاد → شفافية تتناقص (fade out بعيدًا)
- **`-450 < relativeZ < -50`**: دوران تدريجي لتواجه الكاميرا

### 5. العودة

```javascript
bindMovementControls(state, bounds, () => {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    startFadeAndRedirect(`sections.html?domain=${domainId}`, 500);
});
```

التمرير للخلف يعيد المستخدم إلى الأقسام الفرعية لنفس المجال.

---

## مقارنة: قبل وبعد إعادة الهيكلة

| الجانب | قبل (inline) | بعد (module) |
|--------|-------------|--------------|
| حجم HTML | 219 سطرًا | 18 سطرًا |
| مشهد Three.js | مكرر يدويًا | `createSceneContext()` |
| كهف بلوري | مكرر يدويًا | `createCaveTunnel()` |
| حلقة التحريك | مكررة يدويًا | `startAnimationLoop()` |
| التأثيرات الخاصة | مخلوطة بالحلقة | `onFrameUpdate` callback |
| الحركة | مكررة يدويًا | `bindMovementControls()` |
