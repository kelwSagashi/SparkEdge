"use client"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Link } from "react-router-dom"
import type { JSX } from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: JSX.Element
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup className="">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <Link to={item.url}>
              <SidebarMenuButton tooltip={item.title} className="hover:bg-secondary-foreground">
                {item.icon && item.icon}
                <span className="text-primary">{item.title}</span>
                {/* <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
