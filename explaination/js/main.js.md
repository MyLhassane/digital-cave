# js/main.js — نقطة الدخول (Entry Point)

## ما هو هذا الملف؟

هذا هو **الملف الرئيسي** الذي يربط كل أجزاء المشروع معًا. يستورد الوحدات المختلفة وينسق عملها لإنشاء التجربة الكاملة لصفحة المدخل الرئيسي (`index.html`).

---

## كيف يعمل؟

### 1. الاستيرادات (Imports)

```javascript
import { branchesConfig, movementBounds } from "./config.js";
import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveMaterial, createMainTunnelMesh, createBranchMesh } from "./geometry.js";
import { createBranchSignMesh, startFadeAndRedirect } from "./ui.js";
import { bindMovementControls, bindSelectionControls } from "./controls.js";
import { startAnimationLoop } from "./animate.js";
```

يستورد كل ما يحتاجه من الوحدات الست الأخرى. هذا هو **مركز التحكم** للمشروع.

### 2. تهيئة المشهد

```javascript
const { scene, camera, renderer, headlight } = createSceneContext();
const caveMaterial = createCaveMaterial();
const mainTunnel = createMainTunnelMesh(caveMaterial);
scene.add(mainTunnel);
```

ينشئ المشهد الأساسي والكاميرا والمُعرّض، ثم يُنشئ مادة الكهف والأنبوب الرئيسي ويضيفه إلى المشهد.

### 3. بناء الفروع

```javascript
const interactiveTargets = [];
branchesConfig.forEach((cfg) => {
    const branchMesh = createBranchMesh(cfg, caveMaterial);
    scene.add(branchMesh);
    const signMesh = createBranchSignMesh(cfg);
    scene.add(signMesh);
    interactiveTargets.push(signMesh);
});
```

لكل فرع معرفي:
1. يُنشئ ممرًا جانبيًا (`branchMesh`) ويضيفه للمشهد.
2. يُنشئ لوحة إرشادية (`signMesh`) ويضيفها للمشهد.
3. يضيف اللوحة إلى مصفوفة `interactiveTargets` لاستخدامها في Raycaster.

### 4. حالة التطبيق (State)

```javascript
const state = {
    targetZ: 150,         // الموقع المستهدف للكاميرا
    currentZ: 150,        // الموقع الحالي للكاميرا
    touchStartY: 0,       // نقطة بداية اللمس
    isTransitioning: false // هل نحن في طور الانتقال؟
};
```

كائن واحد يجمع كل البيانات التي تحتاجها المكونات المختلفة.

### 5. ربط التفاعلات

```javascript
bindMovementControls(state, movementBounds);
bindSelectionControls({
    state, camera, interactiveTargets,
    onTargetSelected: (target) => {
        state.isTransitioning = true;
        state.targetZ = target.position.z + 50;
        startFadeAndRedirect(target.userData.redirectUrl, 600);
    }
});
bindResizeHandler(camera, renderer);
startAnimationLoop({ state, camera, headlight, renderer, scene });
```

1. **الحركة**: يربط اللمس وعجلة الفأرة.
2. **الاختيار**: عند النقر على لوحة، يوقف التفاعل، يقرب الكاميرا من اللوحة، ويبدأ التلاشي للانتقال.
3. **تغيير الحجم**: يتأقلم مع تغير حجم النافذة.
4. **التحريك**: يبدأ حلقة الرسم المستمرة.

---

## لماذا هذا التصميم (Modular)?

- **فصل المسؤوليات**: كل ملف له وظيفة محددة وواضحة.
- **قابلية إعادة الاستخدام**: يمكن استخدام `scene.js` أو `controls.js` في صفحات أخرى.
- **سهولة التطوير**: تغيير في `geometry.js` لا يؤثر على `controls.js`.
- **قراءة أفضل**: `main.js` يُقرأ كقصة: أنشئ المشهد → أضف الكهف → أضف الفروع → اربط التفاعلات → ابدأ.

---

## تدفق العمل الكامل

```
المستخدم يفتح index.html
        ↓
main.js يُنشئ المشهد ثلاثي الأبعاد
        ↓
الكهف الرئيسي + 3 فروع + 3 لوحات تظهر
        ↓
المستخدم يمرر/يسحب للتحرك في الكهف
        ↓
المستخدم ينقر على لوحة فرع
        ↓
توقف التفاعل → تقريب الكاميرا → تلاشي → انتقال إلى sections.html
```
