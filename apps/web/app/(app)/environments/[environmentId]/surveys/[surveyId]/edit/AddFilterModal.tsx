"use client";

import { TBaseFilterGroupItem } from "@formbricks/types/v1/userSegment";
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, Input, TabBar } from "@formbricks/ui";
import { MonitorSmartphoneIcon, MousePointerClick, PlusCircleIcon, TagIcon, Users2Icon } from "lucide-react";
import { useAttributeClasses } from "@/lib/attributeClasses/attributeClasses";
import { useEventClasses } from "@/lib/eventClasses/eventClasses";
import { createId } from "@paralleldrive/cuid2";
import { useUserSegments } from "@/lib/userSegments/userSegments";

type TAddFilterModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddFilter: (filter: TBaseFilterGroupItem) => void;
  environmentId: string;
};

const AddFilterModal = ({ environmentId, onAddFilter, open, setOpen }: TAddFilterModalProps) => {
  const [activeTabId, setActiveTabId] = useState("actions");

  const { attributeClasses, isLoadingAttributeClasses } = useAttributeClasses(environmentId);
  const { eventClasses, isLoadingEventClasses } = useEventClasses(environmentId);
  const { userSegments, isLoadingUserSegments } = useUserSegments(environmentId);

  const tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[] = [
    { id: "all", label: "All" },
    { id: "actions", label: "Actions", icon: <MousePointerClick className="h-4 w-4" /> },
    { id: "attributes", label: "Attributes", icon: <TagIcon className="h-4 w-4" /> },
    { id: "segments", label: "Segments", icon: <Users2Icon className="h-4 w-4" /> },
    { id: "devices", label: "Devices", icon: <MonitorSmartphoneIcon className="h-4 w-4" /> },
  ];

  const devices = [
    { id: "phone", name: "Phone" },
    { id: "desktop", name: "Desktop" },
  ];

  if (isLoadingAttributeClasses || isLoadingEventClasses || isLoadingUserSegments) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger className="max-w-[160px]">
        <button className="mt-4 flex items-center gap-2 text-sm">
          <PlusCircleIcon className="h-4 w-4" />
          <p>Add filter</p>
        </button>
      </DialogTrigger>

      <DialogContent className="w-[600px] bg-slate-100 sm:max-w-2xl" hideCloseButton>
        <div className="flex w-auto flex-col">
          <Input placeholder="Browse filters..." autoFocus />

          <TabBar className="bg-slate-100" tabs={tabs} activeId={activeTabId} setActiveId={setActiveTabId} />
        </div>

        <div className="flex flex-col gap-2">
          {activeTabId === "actions" && (
            <>
              {eventClasses.map((eventClass) => {
                return (
                  <div
                    onClick={() => {
                      const newFilter: TBaseFilterGroupItem = {
                        id: createId(),
                        connector: "and",
                        resource: {
                          id: createId(),
                          root: {
                            type: "action",
                            actionClassId: eventClass.id,
                          },
                          qualifier: {
                            metric: "occuranceCount",
                            operator: "equals",
                          },
                          value: "",
                        },
                      };

                      onAddFilter(newFilter);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-4 text-sm">
                    <MousePointerClick className="h-4 w-4" />
                    <p>{eventClass.name}</p>
                  </div>
                );
              })}
            </>
          )}

          {activeTabId === "attributes" && (
            <>
              {attributeClasses.map((attributeClass) => {
                return (
                  <div
                    onClick={() => {
                      const newFilter: TBaseFilterGroupItem = {
                        id: createId(),
                        connector: "and",
                        resource: {
                          id: createId(),
                          root: {
                            type: "attribute",
                            attributeClassId: attributeClass.id,
                          },
                          qualifier: {
                            operator: "equals",
                          },
                          value: "",
                        },
                      };

                      onAddFilter(newFilter);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-4 text-sm">
                    <TagIcon className="h-4 w-4" />
                    <p>{attributeClass.name}</p>
                  </div>
                );
              })}
            </>
          )}

          {activeTabId === "segments" && (
            <>
              {userSegments
                ?.filter((segment) => !segment.isPrivate)
                ?.map((userSegment) => {
                  return (
                    <div
                      onClick={() => {
                        const newFilter: TBaseFilterGroupItem = {
                          id: createId(),
                          connector: "and",
                          resource: {
                            id: createId(),
                            root: {
                              type: "segment",
                              userSegmentId: userSegment.id,
                            },
                            qualifier: {
                              operator: "userIsIn",
                            },
                            value: userSegment.id,
                          },
                        };

                        onAddFilter(newFilter);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-4 text-sm">
                      <Users2Icon className="h-4 w-4" />
                      <p>{userSegment.title}</p>
                    </div>
                  );
                })}
            </>
          )}

          {activeTabId === "devices" && (
            <div className="flex flex-col">
              {devices.map((deviceType) => (
                <div
                  key={deviceType.id}
                  className="flex cursor-pointer items-center gap-2 p-1"
                  onClick={() => {
                    const filter: TBaseFilterGroupItem = {
                      id: createId(),
                      connector: "and",
                      resource: {
                        id: createId(),
                        root: {
                          type: "device",
                          deviceType: deviceType.id,
                        },
                        qualifier: {
                          operator: "equals",
                        },
                        value: deviceType.id,
                      },
                    };

                    onAddFilter(filter);
                    setOpen(false);
                  }}>
                  <MonitorSmartphoneIcon className="h-4 w-4" />
                  <span>{deviceType.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFilterModal;
