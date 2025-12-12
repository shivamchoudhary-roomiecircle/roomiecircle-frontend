import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListedByProps {
    lister: {
        id: number;
        name: string;
        profilePicture?: string;
        verificationLevel?: string;
        profileScore?: number;
    };
    onStartChat: () => void;
    isOwnListing: boolean;
}

export function ListedBy({ lister, onStartChat, isOwnListing }: ListedByProps) {
    return (
        <Card className="border border-border/50 shadow-md bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Posted by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={lister?.profilePicture} />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {lister?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-base">{lister?.name || "Host"}</h3>
                        {lister?.verificationLevel && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-normal">
                                    {lister.verificationLevel} Verified
                                </Badge>
                                {lister.profileScore && (
                                    <span className="text-xs text-muted-foreground">• {lister.profileScore} Score</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        className="w-full font-semibold shadow-sm"
                        size="sm"
                        onClick={onStartChat}
                        disabled={isOwnListing}
                    >
                        Start a chat
                    </Button>
                    <Button variant="outline" className="w-full shadow-sm" size="sm">
                        View Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
