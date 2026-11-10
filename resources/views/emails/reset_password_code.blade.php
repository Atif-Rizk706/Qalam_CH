<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>كود إعادة تعيين كلمة المرور</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F8F7F3;
            margin: 0;
            padding: 20px;
            direction: rtl;
            text-align: right;
            color: #333333;
        }
        .container {
            max-width: 550px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            border: 1px solid #EBE8DF;
        }
        .header {
            background-color: #C5A869;
            color: #ffffff;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
        }
        .body-content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 15px;
        }
        .code-box {
            background-color: #FAF8F2;
            border: 2px dashed #C5A869;
            border-radius: 8px;
            padding: 18px;
            text-align: center;
            margin: 25px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2C2C2C;
            font-family: monospace;
            display: inline-block;
        }
        .notice {
            font-size: 13px;
            color: #777777;
            line-height: 1.6;
        }
        .footer {
            background-color: #F8F7F3;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #EBE8DF;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>مكتبة قلم CH</h1>
        </div>
        <div class="body-content">
            <div class="greeting">مرحباً <strong>{{ $userName }}</strong>،</div>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. استخدم كود التحقق التالي لإتمام العملية:</p>
            
            <div class="code-box">
                <span class="code">{{ $code }}</span>
            </div>

            <p class="notice">
                • هذا الكود صالح لمدة <strong>60 دقيقة</strong> فقط.<br>
                • إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان وستظل كلمتك الحالية كما هي.
            </p>
        </div>
        <div class="footer">
            © {{ date('Y') }} مكتبة قلم CH. جميع الحقوق محفوظة.
        </div>
    </div>
</body>
</html>

