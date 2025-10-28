import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, CheckCircle2, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PostRoomSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Have a Room to Rent?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              List your room for free and connect with verified, compatible tenants
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Benefits */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Verified Tenants Only</h3>
                    <p className="text-muted-foreground">
                      Connect with verified students and professionals. LinkedIn and email verification ensures authenticity.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Zero Brokerage</h3>
                    <p className="text-muted-foreground">
                      List your property directly without any middlemen or hidden fees. Keep your full rental amount.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
                    <p className="text-muted-foreground">
                      Our algorithm matches you with tenants based on your preferences and house rules.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Card */}
            <Card className="p-8 shadow-card bg-gradient-to-br from-card to-muted/20 border-2">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-3">Ready to List Your Room?</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your listing in minutes and start connecting with potential roommates today
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    size="lg"
                    variant="hero"
                    className="w-full h-14 text-lg"
                    onClick={() => navigate('/post-room')}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Post Your Room
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Free forever • No credit card required
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-xs text-muted-foreground">Free Listing</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">5 min</p>
                    <p className="text-xs text-muted-foreground">Quick Setup</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">24/7</p>
                    <p className="text-xs text-muted-foreground">Visibility</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostRoomSection;
