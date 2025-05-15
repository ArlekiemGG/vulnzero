
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CTF } from './types';
import CTFCard from './CTFCard';
import { CTFCardSkeleton } from '@/components/ui/loading-skeleton';

interface CTFTabsProps {
  activeCTFs: CTF[];
  pastCTFs: CTF[];
  loading: boolean;
  onRegister: (ctfId: number) => void;
}

const CTFTabs: React.FC<CTFTabsProps> = ({ activeCTFs, pastCTFs, loading, onRegister }) => {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-4 bg-cybersec-darkgray">
        <TabsTrigger 
          value="upcoming" 
          className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
        >
          Próximos CTFs
        </TabsTrigger>
        <TabsTrigger 
          value="past" 
          className="data-[state=active]:bg-cybersec-black data-[state=active]:text-cybersec-neongreen"
        >
          CTFs pasados
        </TabsTrigger>
      </TabsList>

      {/* Próximos CTFs */}
      <TabsContent value="upcoming">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map(i => (
              <CTFCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeCTFs.map(ctf => (
              <CTFCard 
                key={ctf.id} 
                ctf={ctf} 
                onRegister={onRegister} 
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* CTFs pasados */}
      <TabsContent value="past">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map(i => (
              <CTFCardSkeleton key={i} isPast={true} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pastCTFs.map(ctf => (
              <CTFCard 
                key={ctf.id} 
                ctf={ctf}
                isPast={true}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CTFTabs;
