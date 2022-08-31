/* eslint-disable */
import {BufferGeometry, MeshLambertMaterial, Vector3} from 'three'


/** Test picker from ryuga1 */
export default class SubsetPicker {
  /**
   * @param {object} found WHAT SHOULD THIS BE?  currently set to IfcProperties object.
   * @param {object} ifc
   * @param {object} shiftSelect
   */
  pick(found, ifc, shiftSelect) {
    if (this.isTransform) {
      return
    }
    console.log('SubsetPicker#pick, in:', found, ifc, shiftSelect)
    this.preselectModel = {}
    this.preselectModel.id = found.expressID
    // ERROR HERE, no .geometry or .faceIndex..
    this.expressID = ifc.getExpressId(found.geometry, found.faceIndex)
    const selectMaterial = new MeshLambertMaterial({
      transparent: true,
      color: '#fff',
      depthTest: true,
    })
    this.subset = ifc.createSubset({
      modelID: this.preselectModel.id,
      ids: [this.expressID],
      material: selectMaterial,
      scene: this.scene,
      customID: -2,
      removePrevious: !shiftSelect,
    })
    // if (shiftSelect) this.multiExpressID.push(this.expressID)
    this.subset.geometry.computeBoundingBox()
    this.subset.geometry.computeBoundingSphere()
    const points = []
    const expressIDArray = this.subset.geometry.attributes.expressID.array
    const posArray = this.subset.geometry.attributes.position

    for (let i = 0; i < expressIDArray.length; i++) {
      const element = expressIDArray[i]
      if (element === this.expressID) {
        const item = new Vector3(
            posArray.array[3 * i + 0],
            posArray.array[3 * i + 1],
            posArray.array[3 * i + 2])
        points.push(item)
      }
    }

    const geo = new BufferGeometry().setFromPoints(points)
    geo.computeBoundingBox()
    geo.computeBoundingSphere()
    const center = geo.boundingSphere.center
    this.pivot.visible = true
    this.pivot.position.set(center.x, center.y, center.z)
    this.sectionBox.center = center
    this.sectionBox.max = geo.boundingBox.max
    this.sectionBox.min = geo.boundingBox.min
    this.sectionBox.isSectionBox = true
  }
}
