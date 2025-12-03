import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talentCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} professionals</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {category.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {category.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Category-specific content */}
        {talentCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.count} verified professionals available for hire
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {category.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="justify-center">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center py-12 text-muted-foreground">
              <category.icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Talent listings coming soon</h3>
              <p>We're preparing detailed listings for this category</p>
              <Button variant="outline" className="mt-4">
                Get notified when available
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}