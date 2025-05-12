import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const Challenges = () => {
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Web Exploitation 101', category: 'Web', points: 100, solved: true },
    { id: 2, title: 'Reverse Engineering Basics', category: 'Reverse Engineering', points: 150, solved: false },
    { id: 3, title: 'Cryptography Challenges', category: 'Cryptography', points: 200, solved: false },
    { id: 4, title: 'Network Analysis', category: 'Network', points: 120, solved: true },
  ]);

  const categories = [...new Set(challenges.map(challenge => challenge.category))];

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Desafíos</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map(challenge => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      {challenge.title}
                      {challenge.solved && (
                        <Badge variant="secondary">
                          <Check className="h-4 w-4 mr-2" />
                          Resuelto
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Categoría: {challenge.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Puntos: {challenge.points}</p>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button>Ver detalles</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {challenges
                  .filter(challenge => challenge.category === category)
                  .map(challenge => (
                    <Card key={challenge.id}>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          {challenge.title}
                          {challenge.solved && (
                            <Badge variant="secondary">
                              <Check className="h-4 w-4 mr-2" />
                              Resuelto
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Categoría: {challenge.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Puntos: {challenge.points}</p>
                      </CardContent>
                      <CardFooter className="justify-between">
                        <Button>Ver detalles</Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Challenges;
