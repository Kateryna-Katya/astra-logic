document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ИНИЦИАЛИЗАЦИЯ GSAP И LENIS
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ==========================================
    // 2. АНИМАЦИЯ HERO (БЕЗ КОНФЛИКТОВ)
    // ==========================================
    const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 }
    });

    // Принудительно делаем элементы видимыми (чтобы не прятались навсегда)
    gsap.set(['.hero__title', '.fade-in', '.hero__visual'], { autoAlpha: 1 });

    heroTl
        .from('.hero__title', {
            y: 50,
            opacity: 0,
            duration: 1.2
        })
        // Анимируем все .fade-in, КРОМЕ .hero__visual (чтобы избежать двойной анимации)
        .from('.fade-in:not(.hero__visual)', {
            y: 30,
            opacity: 0,
            stagger: 0.2
        }, "-=0.8")
        // Анимируем отдельно визуал
        .from('.hero__visual', {
            scale: 0.9,
            opacity: 0,
            duration: 1.2
        }, "-=1");

    // ==========================================
    // 3. АНИМАЦИИ ПРИ СКРОЛЛЕ (REVEAL)
    // ==========================================
    const animateOnScroll = (selector, props) => {
        gsap.utils.toArray(selector).forEach(el => {
            gsap.set(el, { autoAlpha: 1 });
            gsap.from(el, {
                ...props,
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    };

    animateOnScroll('.reveal-up', { y: 50, opacity: 0, duration: 1 });
    animateOnScroll('.reveal-left', { x: -60, opacity: 0, duration: 1 });
    animateOnScroll('.reveal-right', { x: 60, opacity: 0, duration: 1 });
    animateOnScroll('.reveal-text', { y: 30, opacity: 0, duration: 0.8 });

    // ==========================================
    // 4. АНИМАЦИЯ ЧИСЕЛ (STATS)
    // ==========================================
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const obj = { val: 0 };

        ScrollTrigger.create({
            trigger: counter,
            start: "top 95%",
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        counter.innerText = Math.ceil(obj.val);
                    }
                });
            }
        });
    });

    // ==========================================
    // 5. ЛОГИКА МОБИЛЬНОГО МЕНЮ
    // ==========================================
    const burger = document.getElementById('burger-btn');
    const nav = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.header__link');

    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('open');
            document.body.classList.toggle('no-scroll');
        });

        // Закрываем меню при клике на ссылку
        links.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // ==========================================
    // 6. ЛОГИКА ФОРМЫ (ВАЛИДАЦИЯ + КАПЧА)
    // ==========================================
    const form = document.getElementById('leadForm');
    if (form) {
        const captchaLabel = document.getElementById('captchaLabel');
        const captchaInput = document.getElementById('captchaInput');
        let captchaResult = 0;

        // Генерация капчи
        function initCaptcha() {
            const num1 = Math.floor(Math.random() * 10);
            const num2 = Math.floor(Math.random() * 10);
            captchaResult = num1 + num2;
            if(captchaLabel) captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;
            if(captchaInput) captchaInput.value = '';
        }
        initCaptcha();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Сброс ошибок
            form.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');

            // Проверка Имени
            if(name.value.trim().length < 2) { 
                name.parentElement.classList.add('error'); 
                isValid = false; 
            }
            
            // Проверка Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email.value)) { 
                email.parentElement.classList.add('error'); 
                isValid = false; 
            }

            // Проверка Телефона (минимум 8 цифр)
            const phoneRegex = /^[0-9+\s()]{8,}$/;
            if(!phoneRegex.test(phone.value)) { 
                phone.parentElement.classList.add('error'); 
                isValid = false; 
            }

            // Проверка Капчи
            if(parseInt(captchaInput.value) !== captchaResult) {
                captchaInput.parentElement.classList.add('error');
                isValid = false;
                initCaptcha(); // Обновляем при ошибке
            }

            // Если всё ок
            if(isValid) {
                const btn = form.querySelector('button');
                btn.classList.add('loading'); // Добавляем класс для спиннера

                // Имитация отправки
                setTimeout(() => {
                    btn.classList.remove('loading');
                    const successMsg = document.getElementById('formSuccess');
                    if(successMsg) successMsg.classList.add('visible');
                    form.reset();
                    initCaptcha();
                }, 2000);
            }
        });
    }

    // ==========================================
    // 7. ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ
    // ==========================================
    
    // Пересчет ScrollTrigger после полной загрузки страницы
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // Cookie Popup
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptCookie = document.getElementById('acceptCookie');

    if (cookiePopup && !localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => { cookiePopup.classList.add('show'); }, 2000);
    }

    if (acceptCookie) {
        acceptCookie.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookiePopup.classList.remove('show');
        });
    }
});