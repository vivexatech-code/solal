document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle Logic
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconClose = document.getElementById('icon-close');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !expanded);
            menu.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
            iconMenu.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    }

    // 2. Mobile Menu Accordions
    const accordions = document.querySelectorAll('.mobile-accordion');
    accordions.forEach(acc => {
        const accBtn = acc.querySelector('.accordion-btn');
        const content = acc.querySelector('.accordion-content');
        const chevron = acc.querySelector('svg');

        if (accBtn && content && chevron) {
            accBtn.addEventListener('click', () => {
                content.classList.toggle('hidden');
                chevron.classList.toggle('rotate-180');
                accBtn.classList.toggle('text-blue-800');
            });
        }
    });

    // 3. Scroll Reveal Animations
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    function initializeReveals() {
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    }

    // 4. Data Fetching & Dynamic Routing
    const homepageGrid = document.getElementById('dynamic-services-grid');
    const servicesListingGrid = document.getElementById('dynamic-services-listing');
    const serviceDetailContainer = document.getElementById('dynamic-service-content');
    const homepageIndustriesGrid = document.getElementById('dynamic-industries-grid');
    const industriesListingGrid = document.getElementById('dynamic-industries-listing');
    const industryDetailContainer = document.getElementById('dynamic-industry-content');

    const needsCatalog = homepageGrid || servicesListingGrid || serviceDetailContainer || homepageIndustriesGrid || industriesListingGrid || industryDetailContainer;

    if (needsCatalog) {
        fetch('/data.json')
            .then(response => {
                if (!response.ok) throw new Error("Failed to load site data");
                return response.json();
            })
            .then(data => {
                const activeServices = (data.services || []).filter(s => s.isActive);
                const activeIndustries = (data.industries || []).filter(s => s.isActive);

                if (homepageGrid) renderCards(activeServices, homepageGrid, 'Explore Service');
                if (servicesListingGrid) renderCards(activeServices, servicesListingGrid, 'Explore Service');
                if (homepageIndustriesGrid) renderCards(activeIndustries, homepageIndustriesGrid, 'Explore Industry');
                if (industriesListingGrid) renderCards(activeIndustries, industriesListingGrid, 'Explore Industry');

                if (serviceDetailContainer) {
                    const currentSlug = readSlug();
                    if (currentSlug === 'services' || currentSlug === 'industries') {
                        window.location.href = '/' + currentSlug;
                        return;
                    }
                    const currentService = activeServices.find(s => s.slug === currentSlug);
                    renderDetail(currentService, serviceDetailContainer, {
                        missingNoun: 'Service',
                        missingText: 'The service you are looking for does not exist or is currently inactive.',
                        listingHref: '/services',
                        listingLabel: 'View All Services'
                    });
                }

                if (industryDetailContainer) {
                    const currentSlug = readSlug();
                    if (currentSlug === 'services' || currentSlug === 'industries') {
                        window.location.href = '/' + currentSlug;
                        return;
                    }
                    const currentIndustry = activeIndustries.find(s => s.slug === currentSlug);
                    renderDetail(currentIndustry, industryDetailContainer, {
                        missingNoun: 'Industry',
                        missingText: 'The industry you are looking for does not exist or is currently inactive.',
                        listingHref: '/industries',
                        listingLabel: 'View All Industries'
                    });
                }

                initializeReveals();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                const errorMsg = `<div class="col-span-full text-center py-10 text-red-500">Failed to load content.</div>`;
                if (homepageGrid) homepageGrid.innerHTML = errorMsg;
                if (servicesListingGrid) servicesListingGrid.innerHTML = errorMsg;
                if (homepageIndustriesGrid) homepageIndustriesGrid.innerHTML = errorMsg;
                if (industriesListingGrid) industriesListingGrid.innerHTML = errorMsg;
            });
    } else {
        initializeReveals();
    }

    function readSlug() {
        const urlParams = new URLSearchParams(window.location.search);
        let currentSlug = urlParams.get('slug');
        if (!currentSlug) {
            const pathParts = window.location.pathname.split('/').filter(p => p && !p.includes('.html'));
            if (pathParts.length > 0) currentSlug = pathParts[pathParts.length - 1];
        }
        return currentSlug;
    }

    function itemName(item) {
        return item.serviceName || item.industryName;
    }

    function renderCards(items, container, exploreLabel) {
        container.innerHTML = items.map((item, index) => `
            <div class="bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full reveal reveal-delay-${(index % 3) + 1}">
                <div class="h-48 w-full overflow-hidden relative">
                    <div class="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img src="${item.image}" alt="${itemName(item)}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">
                </div>
                <div class="p-8 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold text-brand-navy mb-3 group-hover:text-blue-800 transition-colors">${itemName(item)}</h3>
                    <p class="text-slate-600 leading-relaxed mb-6 flex-grow">${item.tagline}</p>
                    <a href="/${item.slug}" class="inline-flex items-center text-sm font-bold text-brand-accent group-hover:text-brand-accentHover transition-colors mt-auto">
                        ${exploreLabel}
                        <svg class="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                </div>
            </div>
        `).join('');
    }

    function renderDetail(item, container, labels) {
        if (!item) {
            document.title = "Page Not Found | SOL AL KABEER";
            container.innerHTML = `
                <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
                    <h1 class="text-5xl font-bold text-brand-navy mb-4">404</h1>
                    <h2 class="text-2xl font-bold text-slate-700 mb-4">${labels.missingNoun} Not Found</h2>
                    <p class="text-slate-600 mb-8 max-w-md">${labels.missingText}</p>
                    <a href="${labels.listingHref}" class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-sm text-white bg-blue-800 hover:bg-blue-900 transition-colors">${labels.listingLabel}</a>
                </div>
            `;
            return;
        }

        const name = itemName(item);
        document.title = `${name} | SOL AL KABEER`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', item.heroDescription);

        const coverageCards = item.whatWeCoverPoints.map(point => `
            <div class="bg-white p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h4 class="text-lg font-bold text-brand-navy mb-3">${point.title}</h4>
                <p class="text-slate-600 text-sm leading-relaxed">${point.description}</p>
            </div>
        `).join('');

        container.innerHTML = `
            <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-[#F8FAFC] border-b border-gray-200 overflow-hidden">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div class="reveal">
                            <span class="text-brand-accent font-bold tracking-wider uppercase text-xs mb-4 block">${name}</span>
                            <h1 class="text-4xl sm:text-5xl font-bold text-brand-navy leading-tight tracking-tight mb-6">${item.tagline}</h1>
                            <p class="text-lg text-slate-600 mb-8 max-w-xl font-light leading-relaxed">${item.heroDescription}</p>
                        </div>
                        <div class="relative reveal reveal-delay-2 hidden lg:block h-[400px]">
                            <div class="absolute inset-0 bg-blue-100 transform translate-x-4 translate-y-4 rounded-sm"></div>
                            <img src="${item.image}" alt="${name}" class="relative z-10 w-full h-full object-cover shadow-xl rounded-sm" />
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-24 bg-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div class="lg:col-span-5 reveal">
                            <span class="text-brand-accent font-bold tracking-wider uppercase text-xs mb-4 block">${item.practiceLabel}</span>
                            <h2 class="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight leading-tight">${item.practiceTitle}</h2>
                        </div>
                        <div class="lg:col-span-7 lg:pl-10 reveal reveal-delay-1">
                            <div class="w-16 h-1 bg-brand-accent mb-8"></div>
                            <p class="text-lg text-slate-700 mb-6 leading-relaxed font-medium">${item.practiceDescription}</p>
                            <p class="text-base text-slate-600 leading-relaxed">${item.practiceDetails}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="py-24 bg-slate-50 border-t border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="mb-16 reveal text-center lg:text-left">
                        <span class="text-brand-accent font-bold tracking-wider uppercase text-xs mb-4 block">${item.whatWeCoverLabel}</span>
                        <h2 class="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight">${item.whatWeCoverTitle}</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal reveal-delay-1">
                        ${coverageCards}
                    </div>
                </div>
            </section>

            <section class="py-24 bg-brand-navy relative overflow-hidden">
                <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 reveal">
                    <span class="text-cyan-400 font-bold tracking-wider uppercase text-xs mb-4 block">${item.ctaLabel}</span>
                    <h2 class="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">${item.ctaTitle}</h2>
                    <p class="text-lg text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">${item.ctaDescription}</p>
                    <a href="/contact" class="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-sm text-brand-navy bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg">
                        ${item.ctaButtonText}
                    </a>
                </div>
            </section>
        `;
    }
});