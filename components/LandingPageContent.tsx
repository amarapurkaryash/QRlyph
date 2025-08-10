import React, { useRef, useEffect } from 'react';
import { 
    IconOffline, IconPreview, IconVisibilityOff, IconColorLens, 
    IconScannerFast, IconPrivacy, IconGitHub, IconStar
} from './icons';

const Section: React.FC<{children: React.ReactNode, className?: string, id?: string}> = ({children, className="", id}) => (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    </section>
);

const SectionTitle: React.FC<{children: React.ReactNode, className?: string}> = ({children, className=""}) => (
    <h2 className={`text-3xl sm:text-4xl font-bold text-center text-text-main mb-4 tracking-tight ${className}`}>{children}</h2>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, children }) => (
    <div className="bg-surface p-6 rounded-xl border border-border transform transition-transform duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
        <p className="text-text-subtle">{children}</p>
    </div>
);

const LandingPageContent: React.FC = () => {
    const features = [
        { icon: <IconOffline className="w-6 h-6"/>, title: "Offline-First", description: "Works without the internet after your first visit. Your Wi-Fi credentials never leave your device." },
        { icon: <IconPreview className="w-6 h-6"/>, title: "Real-Time Preview", description: "QR codes update instantly as you type — no extra clicks." },
        { icon: <IconVisibilityOff className="w-6 h-6"/>, title: "Hidden Network Support", description: "Generate codes for networks not visible in scans." },
        { icon: <IconColorLens className="w-6 h-6"/>, title: "Custom Styling", description: "Choose colors, add a logo, and make your QR code match your style." },
        { icon: <IconScannerFast className="w-6 h-6"/>, title: "Lightning-Fast Scanner", description: "Scan from camera or upload an image — QRlyph decodes instantly." },
        { icon: <IconPrivacy className="w-6 h-6"/>, title: "Privacy by Design", description: "100% client-side processing. We never store or send your data anywhere." },
    ];

    const howItWorksSteps = [
        { number: "1", title: "Enter Details", description: "Enter your Wi-Fi name (SSID), password, and choose encryption." },
        { number: "2", title: "Preview Live", description: "Watch your QR code update live." },
        { number: "3", title: "Share or Scan", description: "Download as PNG/SVG/Wi-Fi Card or scan directly with your phone." },
    ];
    
    const parallaxBgRef = useRef<HTMLDivElement>(null);
    const featuresSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => {
            if (featuresSectionRef.current && parallaxBgRef.current) {
                const rect = featuresSectionRef.current.getBoundingClientRect();
                // Move the background up at a fraction of the speed of the scroll, relative to the section's position in the viewport.
                const speed = -0.2;
                parallaxBgRef.current.style.transform = `translateY(${rect.top * speed}px)`;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="border-t border-border">
            {/* Features Section with Parallax */}
            <div ref={featuresSectionRef} className="relative overflow-hidden">
                <div ref={parallaxBgRef} className="parallax-bg"></div>
                <Section id="features">
                    <div className="relative z-10">
                        <SectionTitle>Why QRlyph?</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            {features.map(feature => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title}>
                                    {feature.description}
                                </FeatureCard>
                            ))}
                        </div>
                    </div>
                </Section>
            </div>


            {/* How It Works Section */}
            <Section id="how-it-works" className="bg-surface">
                <SectionTitle>How It Works</SectionTitle>
                <div className="relative flex flex-col md:flex-row justify-center items-stretch gap-8">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className="relative z-10 flex-1 flex flex-col items-center text-center bg-background p-8 rounded-xl border border-border">
                             <div className="flex items-center justify-center w-12 h-12 bg-primary text-on-primary rounded-full font-bold text-xl mb-4 border-4 border-surface">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-2">{step.title}</h3>
                            <p className="text-text-subtle">{step.description}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Combined About & Footer Section */}
            <footer className="border-t border-border bg-background">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <SectionTitle>About</SectionTitle>
                    <p className="text-lg text-text-subtle max-w-3xl mx-auto mb-10 leading-relaxed">
                        QRlyph is an open-source project built to make sharing Wi-Fi safe, fast, and beautiful. It’s completely free and will always stay that way. We thrive on community contributions and would love your help—whether it’s fixing bugs, adding features, or suggesting new ideas!
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <a href="https://github.com/amarapurkaryash" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold bg-primary text-on-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent transition-all duration-200 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] shadow-lg hover:shadow-primary/40">
                            <IconGitHub className="w-6 h-6 mr-3" />
                            GitHub Repository
                        </a>
                         <p className="text-text-subtle max-w-2xl mx-auto mt-2 text-sm">
                            ⭐ If you find QRlyph useful, please consider starring the repo!
                        </p>
                    </div>
                 </div>
            </footer>
        </div>
    );
}

export default LandingPageContent;