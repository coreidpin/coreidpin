import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Construction, ArrowLeft, Home } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  onNavigate: (page: string) => void;
}

export function PlaceholderPage({ title, description, onNavigate }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Construction className="h-10 w-10 text-primary" />
              </div>
              
              <Badge variant="secondary" className="mb-4">
                Coming Soon
              </Badge>
              
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                {description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate('landing')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}