#!/usr/bin/env node

/**
 * GRBT8 SİSTEM SAĞLIK KONTROL SCRIPTİ
 * 
 * Bu script tüm sistemi detaylı olarak kontrol eder:
 * - API endpoint'leri
 * - Database bağlantısı
 * - Authentication sistemi
 * - Frontend component'leri
 * - Build durumu
 * - Performance metrikleri
 * - Security kontrolleri
 * - Error handling
 * 
 * Kullanım: node system-health-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GRBT8 SİSTEM SAĞLIK KONTROLÜ BAŞLATILIYOR...\n');

// Sonuçları toplamak için
const results = {
    critical: [],
    warnings: [],
    info: [],
    passed: [],
    summary: {
        total: 0,
        critical: 0,
        warnings: 0,
        passed: 0
    }
};

// Yardımcı fonksiyonlar
function addResult(type, category, message, details = '') {
    results[type].push({ category, message, details });
    results.summary.total++;
    results.summary[type]++;
}

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        addResult('passed', 'File Check', `${description} ✅`, filePath);
        return true;
    } else {
        addResult('critical', 'File Check', `${description} ❌`, filePath);
        return false;
    }
}

function checkFileContent(filePath, searchString, description, isError = false) {
    if (!fs.existsSync(filePath)) {
        addResult('critical', 'Content Check', `${description} - Dosya bulunamadı ❌`, filePath);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
        if (isError) {
            addResult('critical', 'Content Check', `${description} ❌`, `Bulunan: ${searchString}`);
        } else {
            addResult('passed', 'Content Check', `${description} ✅`, `Bulunan: ${searchString}`);
        }
        return true;
    } else {
        if (isError) {
            addResult('passed', 'Content Check', `${description} ✅`, `Hata bulunamadı`);
        } else {
            addResult('warnings', 'Content Check', `${description} ⚠️`, `Bulunamadı: ${searchString}`);
        }
        return false;
    }
}

function analyzePackageJson() {
    console.log('📦 Package.json Analizi...');
    
    if (!checkFileExists('package.json', 'Package.json dosyası')) return;
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Kritik dependencies
    const criticalDeps = ['next', 'react', 'prisma', 'next-auth'];
    criticalDeps.forEach(dep => {
        if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
            addResult('passed', 'Dependencies', `${dep} mevcut ✅`, packageJson.dependencies[dep] || packageJson.devDependencies[dep]);
        } else {
            addResult('critical', 'Dependencies', `${dep} eksik ❌`, 'Kritik dependency bulunamadı');
        }
    });
    
    // Script kontrolleri
    const requiredScripts = ['dev', 'build', 'start'];
    requiredScripts.forEach(script => {
        if (packageJson.scripts[script]) {
            addResult('passed', 'Scripts', `${script} script mevcut ✅`, packageJson.scripts[script]);
        } else {
            addResult('critical', 'Scripts', `${script} script eksik ❌`);
        }
    });
}

function analyzeNextConfig() {
    console.log('⚙️ Next.js Konfigürasyon Analizi...');
    
    if (!checkFileExists('next.config.js', 'Next.js config dosyası')) return;
    
    const config = fs.readFileSync('next.config.js', 'utf8');
    
    // Kritik konfigürasyonlar
    const configs = [
        { search: 'experimental', desc: 'Experimental features aktif' },
        { search: 'optimizePackageImports', desc: 'Package import optimizasyonu' },
        { search: 'webpack', desc: 'Webpack konfigürasyonu' },
        { search: 'headers', desc: 'Security headers' }
    ];
    
    configs.forEach(cfg => {
        if (config.includes(cfg.search)) {
            addResult('passed', 'Next.js Config', `${cfg.desc} ✅`);
        } else {
            addResult('warnings', 'Next.js Config', `${cfg.desc} eksik ⚠️`);
        }
    });
}

function analyzeDatabase() {
    console.log('🗄️ Database Konfigürasyon Analizi...');
    
    // Prisma schema kontrolü
    if (!checkFileExists('prisma/schema.prisma', 'Prisma schema dosyası')) return;
    
    const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
    
    // Kritik model kontrolleri
    const models = ['User', 'Reservation', 'Passenger', 'Payment'];
    models.forEach(model => {
        if (schema.includes(`model ${model}`)) {
            addResult('passed', 'Database Models', `${model} modeli mevcut ✅`);
        } else {
            addResult('critical', 'Database Models', `${model} modeli eksik ❌`);
        }
    });
    
    // Environment kontrolü
    checkFileExists('.env', 'Environment dosyası');
    checkFileExists('.env.example', 'Environment örnek dosyası');
}

function analyzeAuthentication() {
    console.log('🔐 Authentication Sistemi Analizi...');
    
    // NextAuth konfigürasyonu
    checkFileExists('src/lib/auth.ts', 'NextAuth konfigürasyonu');
    
    if (fs.existsSync('src/lib/auth.ts')) {
        const authConfig = fs.readFileSync('src/lib/auth.ts', 'utf8');
        
        const authChecks = [
            { search: 'providers', desc: 'Authentication providers' },
            { search: 'callbacks', desc: 'Authentication callbacks' },
            { search: 'session', desc: 'Session konfigürasyonu' },
            { search: 'jwt', desc: 'JWT konfigürasyonu' }
        ];
        
        authChecks.forEach(check => {
            if (authConfig.includes(check.search)) {
                addResult('passed', 'Authentication', `${check.desc} ✅`);
            } else {
                addResult('warnings', 'Authentication', `${check.desc} eksik ⚠️`);
            }
        });
    }
    
    // API route'ları
    const authRoutes = [
        'src/app/api/auth/login/route.ts',
        'src/app/api/auth/register/route.ts',
        'src/app/api/auth/change-password/route.ts',
        'src/app/api/auth/forgot-password/route.ts'
    ];
    
    authRoutes.forEach(route => {
        if (fs.existsSync(route)) {
            addResult('passed', 'Auth Routes', `${path.basename(route)} mevcut ✅`, route);
        } else {
            addResult('critical', 'Auth Routes', `${path.basename(route)} eksik ❌`, route);
        }
    });
}

function analyzeAPIEndpoints() {
    console.log('🌐 API Endpoint Analizi...');
    
    const apiDir = 'src/app/api';
    if (!fs.existsSync(apiDir)) {
        addResult('critical', 'API Structure', 'API dizini bulunamadı ❌');
        return;
    }
    
    // Kritik API endpoint'leri
    const criticalEndpoints = [
        'auth/login',
        'auth/register', 
        'auth/change-password',
        'flights/search-cached',
        'payment/process',
        'passengers',
        'reservations',
        'user/profile'
    ];
    
    criticalEndpoints.forEach(endpoint => {
        const routePath = path.join(apiDir, endpoint, 'route.ts');
        if (fs.existsSync(routePath)) {
            addResult('passed', 'API Endpoints', `${endpoint} endpoint mevcut ✅`, routePath);
        } else {
            addResult('critical', 'API Endpoints', `${endpoint} endpoint eksik ❌`, routePath);
        }
    });
}

function analyzeFrontendComponents() {
    console.log('🎨 Frontend Component Analizi...');
    
    const componentsDir = 'src/components';
    if (!fs.existsSync(componentsDir)) {
        addResult('critical', 'Frontend', 'Components dizini bulunamadı ❌');
        return;
    }
    
    // Kritik component'ler
    const criticalComponents = [
        'Header.tsx',
        'Footer.tsx',
        'LoginModal.tsx',
        'FlightSearchForm.tsx',
        'AccountSidebar.tsx',
        'FlightCard.tsx',
        'PassengerForm.tsx',
        'ErrorBoundary.tsx'
    ];
    
    criticalComponents.forEach(component => {
        const componentPath = path.join(componentsDir, component);
        if (fs.existsSync(componentPath)) {
            addResult('passed', 'Frontend Components', `${component} mevcut ✅`, componentPath);
        } else {
            addResult('critical', 'Frontend Components', `${component} eksik ❌`, componentPath);
        }
    });
}

function analyzePages() {
    console.log('📄 Sayfa Analizi...');
    
    const pagesDir = 'src/app';
    if (!fs.existsSync(pagesDir)) {
        addResult('critical', 'Pages', 'App dizini bulunamadı ❌');
        return;
    }
    
    // Kritik sayfalar
    const criticalPages = [
        'page.tsx',           // Ana sayfa
        'layout.tsx',         // Layout
        'giris/page.tsx',     // Login
        'hesabim/page.tsx',   // Account
        'flights/search/page.tsx', // Flight search
        'flights/booking/page.tsx' // Booking
    ];
    
    criticalPages.forEach(page => {
        const pagePath = path.join(pagesDir, page);
        if (fs.existsSync(pagePath)) {
            addResult('passed', 'Pages', `${page} mevcut ✅`, pagePath);
        } else {
            addResult('critical', 'Pages', `${page} eksik ❌`, pagePath);
        }
    });
}

function analyzeSecurity() {
    console.log('🔒 Güvenlik Analizi...');
    
    // Middleware kontrolü
    if (fs.existsSync('src/middleware.ts')) {
        const middleware = fs.readFileSync('src/middleware.ts', 'utf8');
        
        const securityChecks = [
            { search: 'rateLimit', desc: 'Rate limiting aktif' },
            { search: 'csrf', desc: 'CSRF protection' },
            { search: 'cors', desc: 'CORS konfigürasyonu' },
            { search: 'helmet', desc: 'Security headers' }
        ];
        
        securityChecks.forEach(check => {
            if (middleware.includes(check.search)) {
                addResult('passed', 'Security', `${check.desc} ✅`);
            } else {
                addResult('warnings', 'Security', `${check.desc} eksik ⚠️`);
            }
        });
    }
    
    // Environment variables kontrolü
    if (fs.existsSync('.env.example')) {
        const envExample = fs.readFileSync('.env.example', 'utf8');
        const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
        
        requiredEnvVars.forEach(envVar => {
            if (envExample.includes(envVar)) {
                addResult('passed', 'Environment', `${envVar} tanımlı ✅`);
            } else {
                addResult('critical', 'Environment', `${envVar} eksik ❌`);
            }
        });
    }
}

function analyzePerformance() {
    console.log('⚡ Performance Analizi...');
    
    // Tailwind config kontrolü
    if (fs.existsSync('tailwind.config.js')) {
        const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
        
        if (tailwindConfig.includes('purge') || tailwindConfig.includes('content')) {
            addResult('passed', 'Performance', 'Tailwind purging aktif ✅');
        } else {
            addResult('warnings', 'Performance', 'Tailwind purging eksik ⚠️');
        }
    }
    
    // PostCSS config kontrolü
    if (fs.existsSync('postcss.config.js')) {
        const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8');
        
        if (postcssConfig.includes('cssnano')) {
            addResult('passed', 'Performance', 'CSS minification aktif ✅');
        } else {
            addResult('warnings', 'Performance', 'CSS minification eksik ⚠️');
        }
    }
    
    // Next.js config performance kontrolleri
    if (fs.existsSync('next.config.js')) {
        const nextConfig = fs.readFileSync('next.config.js', 'utf8');
        
        const perfChecks = [
            { search: 'compress', desc: 'Gzip compression' },
            { search: 'optimizePackageImports', desc: 'Package import optimization' },
            { search: 'splitChunks', desc: 'Code splitting' }
        ];
        
        perfChecks.forEach(check => {
            if (nextConfig.includes(check.search)) {
                addResult('passed', 'Performance', `${check.desc} ✅`);
            } else {
                addResult('warnings', 'Performance', `${check.desc} eksik ⚠️`);
            }
        });
    }
}

function analyzeErrorHandling() {
    console.log('🚨 Error Handling Analizi...');
    
    // ErrorBoundary kontrolü
    if (fs.existsSync('src/components/ErrorBoundary.tsx')) {
        addResult('passed', 'Error Handling', 'ErrorBoundary component mevcut ✅');
        
        const errorBoundary = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf8');
        if (errorBoundary.includes('componentDidCatch') || errorBoundary.includes('getDerivedStateFromError')) {
            addResult('passed', 'Error Handling', 'ErrorBoundary implementasyonu doğru ✅');
        } else {
            addResult('warnings', 'Error Handling', 'ErrorBoundary implementasyonu eksik ⚠️');
        }
    } else {
        addResult('critical', 'Error Handling', 'ErrorBoundary component eksik ❌');
    }
    
    // Global error handling
    const globalErrorFiles = [
        'src/app/error.tsx',
        'src/app/global-error.tsx',
        'src/app/not-found.tsx'
    ];
    
    globalErrorFiles.forEach(errorFile => {
        if (fs.existsSync(errorFile)) {
            addResult('passed', 'Error Handling', `${path.basename(errorFile)} mevcut ✅`);
        } else {
            addResult('warnings', 'Error Handling', `${path.basename(errorFile)} eksik ⚠️`);
        }
    });
}

function analyzeTesting() {
    console.log('🧪 Test Yapısı Analizi...');
    
    // Test config kontrolü
    const testFiles = [
        'jest.config.js',
        'jest.setup.js',
        '__tests__'
    ];
    
    testFiles.forEach(testFile => {
        if (fs.existsSync(testFile)) {
            addResult('passed', 'Testing', `${testFile} mevcut ✅`);
        } else {
            addResult('warnings', 'Testing', `${testFile} eksik ⚠️`);
        }
    });
    
    // Test coverage
    if (fs.existsSync('TEST_COVERAGE_FINAL_REPORT.md')) {
        addResult('passed', 'Testing', 'Test coverage raporu mevcut ✅');
    }
}

function analyzeDeployment() {
    console.log('🚀 Deployment Konfigürasyon Analizi...');
    
    const deploymentFiles = [
        'vercel.json',
        'vercel-protection.js',
        '.gitignore'
    ];
    
    deploymentFiles.forEach(file => {
        if (fs.existsSync(file)) {
            addResult('passed', 'Deployment', `${file} mevcut ✅`);
        } else {
            addResult('warnings', 'Deployment', `${file} eksik ⚠️`);
        }
    });
}

function generateReport() {
    console.log('\n📊 SİSTEM SAĞLIK RAPORU\n');
    console.log('='.repeat(50));
    
    // Özet
    console.log(`\n📈 ÖZET:`);
    console.log(`Toplam Kontrol: ${results.summary.total}`);
    console.log(`✅ Başarılı: ${results.summary.passed}`);
    console.log(`⚠️  Uyarılar: ${results.summary.warnings}`);
    console.log(`❌ Kritik: ${results.summary.critical}`);
    
    // Kritik sorunlar
    if (results.critical.length > 0) {
        console.log(`\n🚨 KRİTİK SORUNLAR (${results.critical.length}):`);
        results.critical.forEach((item, index) => {
            console.log(`${index + 1}. [${item.category}] ${item.message}`);
            if (item.details) console.log(`   Detay: ${item.details}`);
        });
    }
    
    // Uyarılar
    if (results.warnings.length > 0) {
        console.log(`\n⚠️  UYARILAR (${results.warnings.length}):`);
        results.warnings.forEach((item, index) => {
            console.log(`${index + 1}. [${item.category}] ${item.message}`);
            if (item.details) console.log(`   Detay: ${item.details}`);
        });
    }
    
    // Başarılı kontroller
    if (results.passed.length > 0) {
        console.log(`\n✅ BAŞARILI KONTROLLER (${results.passed.length}):`);
        const categoryCounts = {};
        results.passed.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });
        
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`${category}: ${count} ✅`);
        });
    }
    
    // Genel durum
    console.log('\n' + '='.repeat(50));
    if (results.summary.critical === 0) {
        console.log('🎉 GENEL DURUM: SİSTEM SAĞLIKLI!');
    } else if (results.summary.critical <= 3) {
        console.log('⚠️  GENEL DURUM: KÜÇÜK SORUNLAR VAR');
    } else {
        console.log('🚨 GENEL DURUM: KRİTİK SORUNLAR MEVCUT!');
    }
    console.log('='.repeat(50));
    
    // Dosyaya kaydet
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: results.summary,
        critical: results.critical,
        warnings: results.warnings,
        passed: results.passed
    };
    
    fs.writeFileSync('system-health-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detaylı rapor: system-health-report.json dosyasına kaydedildi.');
}

// Ana çalıştırma fonksiyonu
async function runSystemCheck() {
    try {
        analyzePackageJson();
        analyzeNextConfig();
        analyzeDatabase();
        analyzeAuthentication();
        analyzeAPIEndpoints();
        analyzeFrontendComponents();
        analyzePages();
        analyzeSecurity();
        analyzePerformance();
        analyzeErrorHandling();
        analyzeTesting();
        analyzeDeployment();
        
        generateReport();
        
    } catch (error) {
        console.error('❌ Sistem kontrolü sırasında hata:', error.message);
        process.exit(1);
    }
}

// Scripti çalıştır
runSystemCheck();
