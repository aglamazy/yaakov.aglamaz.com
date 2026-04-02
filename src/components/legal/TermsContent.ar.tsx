'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsContentAr() {
  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto px-2 sm:px-4" dir="rtl">
        <h1 className="text-3xl font-bold text-charcoal mb-3">الشروط والأحكام</h1>
        <p className="text-sage-700 mb-8">تحكم هذه الشروط والأحكام استخدامك لهذا الموقع.</p>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">استخدام الخدمة</h2>
            <p className="text-sage-700 leading-relaxed">
              استخدم الموقع بمسؤولية. لا تخالف القوانين أو تسيء استخدام الميزات أو تضر بالآخرين. قد نعلق الحسابات التي تنتهك هذه الشروط.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">المحتوى والملكية</h2>
            <p className="text-sage-700 leading-relaxed">
              تحتفظ بملكية المحتوى الذي ترسله. بالنشر، تمنحنا ترخيصًا لعرضه داخل الموقع كما يحدده المسؤولون.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">الخصوصية</h2>
            <p className="text-sage-700 leading-relaxed">
              نعالج البيانات الشخصية وفقًا لممارسات الخصوصية لدينا. يقتصر الوصول على الأعضاء والمسؤولين المصرح لهم.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">الحسابات والأمان</h2>
            <p className="text-sage-700 leading-relaxed">
              أنت مسؤول عن الحفاظ على سرية حسابك وعن جميع الأنشطة التي تتم من خلاله. أبلغ المسؤولين عن أي استخدام غير مصرح به.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">التغييرات على هذه الشروط</h2>
            <p className="text-sage-700 leading-relaxed">
              قد نحدث هذه الشروط من وقت لآخر. يعتبر الاستمرار في الاستخدام قبولاً للشروط المحدثة.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">أسئلة</h2>
            <p className="text-sage-700 leading-relaxed">
              إذا كانت لديك أسئلة حول هذه الشروط، يرجى التواصل معنا عبر صفحة الاتصال.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
