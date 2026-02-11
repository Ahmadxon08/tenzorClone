export function FullLoading() {
    return (
        <div style={{width: 'auto', height: '100vh'}}>
            <div className="flex h-full w-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>
        </div>
    );
};