# شريان — شبكة الإنقاذ والتبرع العاجل بالدم (نسخة تجريبية)

هذه نسخة عرض تعمل بحالات وهمية، ولا تحتاج خادماً.

## الخطوة 1: الرفع على GitHub Pages
1. أنشئ مستودعاً عاماً جديداً باسم: shiryan
2. اضغط: uploading an existing file
3. اسحب محتويات هذا المجلد (وليس المجلد نفسه)، ثم: Commit changes
4. افتح: Settings ← Pages
5. اختر: Deploy from a branch ← main ← / (root) ← Save
6. الرابط سيكون: https://alialsaffarmosuluniversity.github.io/shiryan/

## الخطوة 2: ملف الأندرويد
1. افتح: https://www.pwabuilder.com
2. الصق الرابط، ثم: Start
3. Package For Stores ← Android ← Generate Package
4. غيّر Package ID إلى: io.github.alialsaffarmosuluniversity.shiryan
5. Download Package

احتفظ بملفي signing.keystore و signing-key-info في مكان آمن، ولا ترفعهما إلى GitHub.

## ما يعمل في النسخة التجريبية
- محاكاة حالة طارئة: اهتزاز بنمط نبضة القلب، صوت، وميض، وإشعار في الهاتف.
- مسار كامل: التنبيه ← تأكيد الأهلية ← الطريق ← تتبّع أثر التبرع.
- في التتبّع التجريبي كل مرحلة تستغرق 6 ثوانٍ.

## ما يحتاج النسخة الكاملة
- خادم يستقبل الحالات من المستشفيات ويرسل الإشعارات حسب الموقع والفصيلة.
- تجاوز وضع عدم الإزعاج الحقيقي يحتاج تطبيق أندرويد أصلياً، لا يتوفر في تطبيقات الويب.
- شروط الأهلية يجب أن يعتمدها بنك الدم.
