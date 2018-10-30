import * as LMG from './land-mark-geometry'

import * as OG from './opening-geometry'

import * as WMG from './wall-mark-geometry'

import * as HLFG from './houselayout-flag-geometry' 

import * as Entity from '../entity/entity'

import {RoomGeometry} from './room-geometry'

import {InnerWallGeometry} from './inner-wall-geometry'

import {BaseEntityGeometry} from './entity-geometry'



export class  HouseLayoutGeometryFactory {
    static  CreateGeometry(entity: Entity.BaseEntity): BaseEntityGeometry {
        let result = null;

        // room 
        if (entity instanceof Entity.Room) {
            result = new RoomGeometry(<Entity.Room> entity);
        } else if (entity instanceof Entity.FixedWindowFlag) {
            result = new OG.FixedWindowFlagGeometry(<Entity.FixedWindowFlag> entity);
        } else if (entity instanceof Entity.FloorWindowFlag) {
            result = new OG.FloorWindowFlagGeometry(<Entity.FloorWindowFlag> entity);
        } else if (entity instanceof Entity.BayWindowFlag) {
            result = new OG.BayWindowFlagGeometry(<Entity.BayWindowFlag> entity);
        } else if (entity instanceof Entity.OneDoorFlag) {
            result = new OG.OneDoorFlagGeometry(<Entity.OneDoorFlag> entity);
        } else if (entity instanceof Entity.TwoDoorsFlag) {
            result = new OG.TwoDoorsGFlagGeometry(<Entity.TwoDoorsFlag> entity);
        } else if (entity instanceof Entity.SlidingDoorsFlag) {
            result = new OG.SlidingDoorsFlagGeometry(<Entity.SlidingDoorsFlag> entity);
        } else if (entity instanceof Entity.DoorwayFlag) {
            result = new OG.DoorwayFlagGeometry(<Entity.DoorwayFlag> entity);
        } else if (entity instanceof Entity.Opening) {
            result = new OG.OpeningGeometry(<Entity.Opening> entity);
        } else if (entity instanceof Entity.PillarFlag) {
            result = new HLFG.PillarFlagGeometry(<Entity.PillarFlag> entity);
        } else if (entity instanceof Entity.FlueFlag) {
            result = new HLFG.FlueFlagGeometry(<Entity.FlueFlag> entity);
        } else if (entity instanceof Entity.GirderFlag) {
            result = new HLFG.GirderFlagGeometry(<Entity.GirderFlag> entity);
        } else if (entity instanceof Entity.FloorDrainlFlag) {
            result = new LMG.FloorDrainFlagGeometry(<Entity.FloorDrainlFlag> entity);
        } else if (entity instanceof Entity.UphillFlag) {
            result = new LMG.UphillFlagGeometry(<Entity.UphillFlag> entity);
        } else if (entity instanceof Entity.PipelienFlag) {
            result = new LMG.PipelienFlagGeometry(<Entity.PipelienFlag> entity);
        } else if (entity instanceof Entity.StrongElectricBoxFlag) {
            result = new WMG.StrongElectricBoxFlagGeometry(<Entity.StrongElectricBoxFlag> entity);
        } else if (entity instanceof Entity.WeakBoxFlag) {
            result = new WMG.WeakBoxFlagGeometry(<Entity.WaterMeterFlag> entity);
        } else if (entity instanceof Entity.KtFlag) {
            result = new WMG.KtFlagGeometry(<Entity.KtFlag> entity );
        } else if (entity instanceof Entity.RadiatorFlag) {
            result = new WMG.RadiatorFlagGeometry(<Entity.RadiatorFlag> entity);
        } else if (entity instanceof Entity.HangingFireplaceFlag) {
            result = new WMG.HangingFireplaceFlagGeometry(<Entity.HangingFireplaceFlag> entity);
        } else if (entity instanceof Entity.GasMeterFlag) {
            result = new WMG.GasMeterFlagGeometry(<Entity.GasMeterFlag> entity);
        } else if (entity instanceof Entity.WaterMeterFlag) {
            result = new WMG.WaterMeterFlagGeometry(<Entity.WaterMeterFlag> entity);
        } else if (entity instanceof Entity.InnerWall) {
            result = new InnerWallGeometry(<Entity.InnerWall> entity);
        }

        
        return result;
    }  
}