package services

import models._


/**
 * Service to manipulate curation objects.
 */
trait CurationService {
  def insert(curation: CurationObject)

  /**
   * Get curation object.
   */
  def get(id: UUID): Option[CurationObject]

  /**
   * remove curation object, also delete it from staging area.
   */
  def remove(id: UUID): Unit

  /**
   * add metadata to curation object, no influence to live object
   */
  def addUserMetadata(id: UUID, json: String)
}
