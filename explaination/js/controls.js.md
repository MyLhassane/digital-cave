# js/controls.js — التحكم في الحركة والاختيار

## ما هو هذا الملف؟

هذا الملف يحتوي على نظامين للتفاعل:
1. **الحركة**: التمرير باللمس أو عجلة الفأرة للتحرك داخل الكهف.
2. **الاختيار**: النقر على العناصر التفاعلية (اللوحات الإرشادية).

---

## دوال مساعدة

### `clamp(value, min, max)`
```javascript
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
```
تقيّد القيمة بين حدين أدنى وأقصى. تستخدم لمنع الكاميرا من تجاوز حدود الكهف.

---

## الدوال الأساسية

### 1. `bindMovementControls(state, bounds, onExceedMax)`

تربط أحداث اللمس وعجلة الفأرة بحركة الكاميرا:

#### اللمس (Touch)
```javascript
window.addEventListener("touchstart", (e) => {
    state.touchStartY = e.touches[0].clientY;
}, { passive: false });
```
- عند بدء اللمس، تسجل موقع الإصبع الرأسي (Y).

```javascript
window.addEventListener("touchmove", (e) => {
    if (state.isTransitioning) return;  // ←新增: منع الحركة أثناء الانتقال
    e.preventDefault();
    const deltaY = state.touchStartY - touchY;
    state.targetZ -= deltaY * 2.0;

    if (onExceedMax && state.targetZ > bounds.maxZ) {
        onExceedMax();             // استدعاء دالة الخروج
        state.targetZ = bounds.maxZ;
        state.touchStartY = touchY;
        return;
    }

    state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
    state.touchStartY = touchY;
}, { passive: false });
```
- `state.isTransitioning` — يمنع الحركة إذا كان المستخدم في طور الانتقال لصفحة أخرى.
- `onExceedMax` — دالة استدعاء تُستدعى عندما يحاول المستخدم تجاوز الحد الخلفي (الخروج من الكهف).

#### عجلة الفأرة (Wheel)
```javascript
window.addEventListener("wheel", (e) => {
    if (state.isTransitioning) return;
    state.targetZ -= e.deltaY * 0.75;

    if (onExceedMax && state.targetZ > bounds.maxZ) {
        onExceedMax();
        state.targetZ = bounds.maxZ;
        return;
    }

    state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
});
```

#### كيف يُستخدم `onExceedMax`؟

في `sections-main.js` و `posts-main.js`، عندما يحاول المستخدم الرجوع للخلف أكثر من المسموح، يتم تشغيل تلاشي وإعادة توجيه:
```javascript
bindMovementControls(state, bounds, () => {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    startFadeAndRedirect("index.html", 500);  // أو sections.html حسب الصفحة
});
```

في `main.js` (المدخل الرئيسي)، لا يُمرر `onExceedMax` — فقط يتم تثبيت الكاميرا عند الحدود.

### 2. `bindSelectionControls({ state, camera, interactiveTargets, onTargetSelected })`

تربط النقر (بالماوس أو اللمس) بالاكتشاف (Raycasting):

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
```

#### كيف يعمل Raycasting؟
1. تحويل إحداثيات النقر من شاشة (pixels) إلى إحداثيات Three.js (Normalized Device Coordinates: -1 إلى 1).
2. إطلاق شعاع (ray) من الكاميرا عبر تلك النقطة.
3. فحص تقاطع الشعاع مع العناصر التفاعلية (`interactiveTargets`).
4. إذا وجد تقاطع، استدعاء `onTargetSelected` مع العنصر المحدد.

#### منع التفاعل أثناء الانتقال
```javascript
if (state.isTransitioning) { return; }
```
يمنع النقر على العناصر الأخرى بينما المستخدم في طور الانتقال إلى صفحة أخرى.

---

## تدفق الاستخدام

```javascript
bindMovementControls(state, movementBounds);
bindSelectionControls({
    state, camera, interactiveTargets,
    onTargetSelected: (target) => {
        // transition logic
    }
});
```

الحركة والاختيار يعملان معًا: المستخدم يتحرك في الكهف باللمس/التمرير، وعندما يرى لوحة تعجبه، ينقر عليها للذهاب إلى وجهتها.
