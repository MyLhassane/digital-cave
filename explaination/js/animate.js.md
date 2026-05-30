# js/animate.js — حلقة التحريك (Animation Loop)

## ما هو هذا الملف؟

هذا الملف يحتوي على **حلقة التحريك الرئيسية** التي تشغّل المشهد باستمرار وتحدّث موقع الكاميرا لخلق حركة سلسة.

جميع صفحات المشروع الثلاثة (`index.html`، `sections.html`، `posts.html`) تستخدم **نفس دالة التحريك** من هذا الملف. لا يوجد كود مكرر.

---

## الدالة: `startAnimationLoop({ state, camera, headlight, renderer, scene, onFrameUpdate })`

### كيف تعمل؟

```javascript
function animate() {
    requestAnimationFrame(animate);
    state.currentZ += (state.targetZ - state.currentZ) * 0.08;
    camera.position.z = state.currentZ;
    headlight.position.z = state.currentZ - 10;

    if (onFrameUpdate) onFrameUpdate(state);  // ←新增

    renderer.render(scene, camera);
}
animate();
```

### شرح التفاصيل:

1. **`requestAnimationFrame(animate)`** — تستدعي نفسها ~60 مرة/ثانية لإنشاء حلقة مستمرة.

2. **الاستيفاء الخطي (Lerp)**
   ```javascript
   state.currentZ += (state.targetZ - state.currentZ) * 0.08;
   ```
   الفرق بين الهدف (`targetZ`) والحالي (`currentZ`) يُضرب في 0.08 لحركة سلسة.

3. **تحديث مواقع الكاميرا والكشاف** — يتحركان معًا على المحور Z.

4. **`onFrameUpdate(state)` — دالة استدعاء اختيارية**
   - إذا وُجدت، تُستدعى في كل إطار بعد تحريك الكاميرا وقبل الرسم.
   - تستخدمها **`posts-main.js`** لإضافة تأثيرات خاصة:
     - تغيير ألوان جدران الكهف تدريجيًا (Color Interpolation)
     - تحريك شفافية ودوران لوحات المقالات
     - تحديث لون الضباب ليتناسب مع الجدران

---

## لماذا قيمة 0.08؟

رقم تجريبي. لو كان أكبر (مثل 0.2)، الحركة أسرع لكن أقل نعومة. لو أصغر (مثل 0.02)، أكثر نعومة لكن أبطأ. 0.08 توازن جيد.
