interface JarvisAvatarProps {
  isActive: boolean;
}

export const JarvisAvatar = ({ isActive }: JarvisAvatarProps) => {
  return (
    <div className="relative">
      {/* Main Avatar Circle */}
      <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center transition-all duration-300 ${
        isActive ? 'animate-pulse-glow scale-110' : 'animate-float'
      }`}>
        <div className="w-16 h-16 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-2xl font-bold text-primary-foreground">J</div>
        </div>
      </div>
      
      {/* Orbiting Rings */}
      <div className={`absolute inset-0 rounded-full border-2 border-primary/30 transition-all duration-1000 ${
        isActive ? 'animate-spin scale-125' : ''
      }`} style={{ animationDuration: '3s' }} />
      
      <div className={`absolute inset-0 rounded-full border border-secondary/20 transition-all duration-1000 ${
        isActive ? 'animate-spin scale-150' : ''
      }`} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
      
      {/* Status Indicator */}
      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
        isActive 
          ? 'bg-primary animate-pulse-glow' 
          : 'bg-muted'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-primary-foreground' : 'bg-muted-foreground'
        }`} />
      </div>
    </div>
  );
};