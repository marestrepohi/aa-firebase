'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Entity } from '@/lib/types';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { CreateEntityForm } from './create-entity-form';
import { Logomark } from './icons';

export function MainSidebar({ entities }: { entities: Entity[] }) {
  const pathname = usePathname();
  const [isCreateOpen, setCreateOpen] = React.useState(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Logomark className="size-5 fill-primary" />
          </Button>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            ADL Analytics Hub
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {entities.map(entity => (
            <SidebarMenuItem key={entity.id}>
              <Link href={`/entities/${entity.id}`} className="block">
                <SidebarMenuButton
                  isActive={pathname.startsWith(`/entities/${entity.id}`)}
                  tooltip={{ children: entity.name }}
                >
                  {entity.name}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            >
              <Plus className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden ml-2">
                New Entity
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
              <DialogDescription>
                An entity is a container for your use cases, like a department or a project.
              </DialogDescription>
            </DialogHeader>
            <CreateEntityForm setOpen={setCreateOpen} />
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
