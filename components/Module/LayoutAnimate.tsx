import AnimatedNetworkBackground from '../Module/AnimateFondo'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AnimatedNetworkBackground />
            <div className="relative z-10">
                {children}
            </div>
        </>
    )
}