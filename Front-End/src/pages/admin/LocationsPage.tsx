import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { Plus, Edit, Trash, MapPin, Map } from "lucide-react";
import type { Location } from "@/types/location.type";
import { locationApi } from "@/services/location.service";
import { toast } from "sonner";
import Spinner from "@/components/Spinner";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import LocationMap from "@/components/LocationMap";

export default function LocationsPage() {
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [showEditLocationDialog, setShowEditLocationDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [editLocationId, setEditLocationId] = useState<number | null>(null);
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    address: "",
    country: "",
    latitude: "",
    longitude: "",
    radius: "1000",
    active: true,
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    locationId: number | null;
    locationName: string;
  }>({
    isOpen: false,
    locationId: null,
    locationName: "",
  });

  // State cho bản đồ
  const [mapLatitude, setMapLatitude] = useState(10.8231); // Mặc định là TP.HCM
  const [mapLongitude, setMapLongitude] = useState(106.6297);
  const [, setIsMapMode] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const data = await locationApi.getAllLocations();
      if (data) setLocations(data);
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(newLocationData);

    const newLocation = {
      name: newLocationData.name,
      address: newLocationData.address,
      country: newLocationData.country,
      latitude: parseFloat(newLocationData.latitude),
      longitude: parseFloat(newLocationData.longitude),
      radius: parseInt(newLocationData.radius),
      active: newLocationData.active,
    };

    const addedLocation = await locationApi.addLocation(newLocation);
    if (addedLocation) {
      setShowAddLocationDialog(false);
      setLocations((prev) => [...prev, addedLocation]);
      toast.success("Thêm địa điểm mới thành công!");
    } else {
      // Xử lý lỗi, có thể toast.error hoặc alert
    }
  };

  const handleEditLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editLocationId === null) return;

    const updatedLocation = await locationApi.updateLocation(
      editLocationId,
      newLocationData
    );
    if (updatedLocation) {
      setShowAddLocationDialog(false);
      setLocations((prev) =>
        prev.map((location) =>
          location.id === editLocationId ? updatedLocation : location
        )
      );
      toast.success("Cập nhật địa điểm thành công!");
      setShowEditLocationDialog(false);
      resetLocationForm();
    } else {
      // Xử lý lỗi
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.locationId === null) return;

    const success = await locationApi.deleteLocation(deleteDialog.locationId);
    if (success) {
      setLocations((prev) =>
        prev.filter((location) => location.id !== deleteDialog.locationId)
      );
      toast.success("Xóa địa điểm thành công!");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      locationId: null,
      locationName: "",
    });
  };

  const resetLocationForm = () => {
    setNewLocationData({
      name: "",
      address: "",
      country: "",
      latitude: "",
      longitude: "",
      radius: "1000",
      active: true,
    });
    setEditLocationId(null);
    setMapLatitude(10.8231);
    setMapLongitude(106.6297);
    setIsMapMode(false);
  };

  const openEditDialog = (id: number) => {
    const locationToEdit = locations.find((location) => location.id === id);
    if (locationToEdit) {
      setNewLocationData({
        name: locationToEdit.name,
        address: locationToEdit.address,
        country: locationToEdit.country,
        latitude: locationToEdit.latitude.toString(),
        longitude: locationToEdit.longitude.toString(),
        radius: locationToEdit.radius.toString(),
        active: locationToEdit.active,
      });
      setMapLatitude(locationToEdit.latitude);
      setMapLongitude(locationToEdit.longitude);
      setEditLocationId(id);
      setShowEditLocationDialog(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setMapLatitude(lat);
    setMapLongitude(lng);
    setNewLocationData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const openMapDialog = () => {
    // Khởi tạo vị trí bản đồ từ form hiện tại hoặc vị trí mặc định
    const currentLat = parseFloat(newLocationData.latitude) || 10.8231;
    const currentLng = parseFloat(newLocationData.longitude) || 106.6297;
    setMapLatitude(currentLat);
    setMapLongitude(currentLng);
    setShowMapDialog(true);
  };

  const confirmMapLocation = () => {
    setNewLocationData((prev) => ({
      ...prev,
      latitude: mapLatitude.toString(),
      longitude: mapLongitude.toString(),
    }));
    setShowMapDialog(false);
  };

  if (loading) {
    return <Spinner layout="admin" />;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý địa điểm làm việc</CardTitle>
              <CardDescription>
                Quản lý các địa điểm và chi nhánh làm việc
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddLocationDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa điểm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Card key={location.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    {location.name}
                  </CardTitle>
                  <CardDescription>{location.address}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quốc gia:</span>
                      <span>{location.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vĩ độ:</span>
                      <span>{location.latitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kinh độ:</span>
                      <span>{location.longitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bán kính:</span>
                      <Badge variant="outline">{location.radius}m</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge
                        variant={location.active ? "default" : "secondary"}
                      >
                        {location.active ? "Đang hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(location.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setDeleteDialog({
                        isOpen: true,
                        locationId: location.id,
                        locationName: location.name,
                      });
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm địa điểm mới */}
      <Dialog
        open={showAddLocationDialog}
        onOpenChange={setShowAddLocationDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm địa điểm mới</DialogTitle>
            <DialogDescription>
              Thêm một địa điểm làm việc hoặc chi nhánh mới.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLocation}>
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={newLocationData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Địa chỉ
                </Label>
                <Input
                  id="address"
                  name="address"
                  className="col-span-3"
                  value={newLocationData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Quốc gia
                </Label>
                <Input
                  id="country"
                  name="country"
                  className="col-span-3"
                  value={newLocationData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="latitude" className="text-right">
                  Vĩ độ
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    className="flex-1"
                    placeholder="VD: 12.345678"
                    value={newLocationData.latitude}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openMapDialog}
                    className="flex items-center gap-1"
                  >
                    <Map className="h-4 w-4" />
                    Chọn
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longitude" className="text-right">
                  Kinh độ
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    className="flex-1"
                    placeholder="VD: 98.765432"
                    value={newLocationData.longitude}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openMapDialog}
                    className="flex items-center gap-1"
                  >
                    <Map className="h-4 w-4" />
                    Chọn
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="radius" className="text-right">
                  Bán kính (m)
                </Label>
                <Input
                  id="radius"
                  name="radius"
                  type="number"
                  className="col-span-3"
                  placeholder="Bán kính cho phép check-in (mét)"
                  value={newLocationData.radius}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Trạng thái
                </Label>
                <div className="col-span-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={newLocationData.active}
                      onChange={(e) =>
                        setNewLocationData((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Đang hoạt động</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddLocationDialog(false);
                  resetLocationForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Thêm địa điểm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa địa điểm */}
      <Dialog
        open={showEditLocationDialog}
        onOpenChange={setShowEditLocationDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa địa điểm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin địa điểm làm việc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLocation}>
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Tên
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={newLocationData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Địa chỉ
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  className="col-span-3"
                  value={newLocationData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-country" className="text-right">
                  Quốc gia
                </Label>
                <Input
                  id="edit-country"
                  name="country"
                  className="col-span-3"
                  value={newLocationData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-latitude" className="text-right">
                  Vĩ độ
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="edit-latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    className="flex-1"
                    placeholder="VD: 12.345678"
                    value={newLocationData.latitude}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openMapDialog}
                    className="flex items-center gap-1"
                  >
                    <Map className="h-4 w-4" />
                    Chọn
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-longitude" className="text-right">
                  Kinh độ
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="edit-longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    className="flex-1"
                    placeholder="VD: 98.765432"
                    value={newLocationData.longitude}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openMapDialog}
                    className="flex items-center gap-1"
                  >
                    <Map className="h-4 w-4" />
                    Chọn
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-radius" className="text-right">
                  Bán kính (m)
                </Label>
                <Input
                  id="edit-radius"
                  name="radius"
                  type="number"
                  className="col-span-3"
                  placeholder="Bán kính cho phép check-in (mét)"
                  value={newLocationData.radius}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Trạng thái
                </Label>
                <div className="col-span-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={newLocationData.active}
                      onChange={(e) =>
                        setNewLocationData((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Đang hoạt động</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditLocationDialog(false);
                  resetLocationForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xoá địa điểm*/}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.locationName}
        description="Bạn có chắc chắn muốn xóa địa điểm"
      />

      {/* Dialog chọn vị trí trên bản đồ */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chọn vị trí trên bản đồ</DialogTitle>
            <DialogDescription>
              Nhấp vào bản đồ để chọn vị trí hoặc kéo marker để di chuyển. Vị trí hiện tại: {mapLatitude.toFixed(6)}, {mapLongitude.toFixed(6)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <LocationMap
              latitude={mapLatitude}
              longitude={mapLongitude}
              onLocationChange={handleMapLocationChange}
              height="500px"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMapDialog(false)}
            >
              Hủy
            </Button>
            <Button type="button" onClick={confirmMapLocation}>
              Xác nhận vị trí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
