"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export default function AdminManagementPage() {

  const [
    admins,
    setAdmins,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showAdd,
    setShowAdd,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState<any>(null);

  const [
    form,
    setForm,
  ] = useState({
    ad_id: "",
    ad_name: "",
    password: "",
  });

  useEffect(() => {

    fetchAdmins();

  }, []);

  const fetchAdmins =
    async (
      query = ""
    ) => {

      setLoading(
        true
      );

      let q =
        supabase
          .from(
            "admin"
          )
          .select("*")
          .order(
            "ad_id"
          );

      if (
        query.trim()
      ) {

        q = q.ilike(
          "ad_id",
          `%${query.trim()}%`
        );

      }

      const {
        data,
      } =
        await q;

      setAdmins(
        data || []
      );

      setLoading(
        false
      );

    };

  const resetForm =
    () => {

      setForm({
        ad_id: "",
        ad_name: "",
        password: "",
      });

      setEditing(
        null
      );

    };

  const saveAdmin =
    async () => {

      if (
        !form.ad_id ||
        !form.ad_name ||
        !form.password
      ) {

        return;
      }

      setSaving(
        true
      );

      if (
        editing
      ) {

        await supabase
          .from(
            "admin"
          )
          .update({
            password:
              form.password,
          })
          .eq(
            "ad_id",
            editing
          );

      }

      else {

        await supabase
          .from(
            "admin"
          )
          .insert({
            ad_id:
              form.ad_id,

            ad_name:
              form.ad_name,

            password:
              form.password,
          });

      }

      setSaving(
        false
      );

      setShowAdd(
        false
      );

      resetForm();

      fetchAdmins(
        search
      );

    };

  const deleteAdmin =
    async (
      id: string
    ) => {

      if (
        !window.confirm(
          "Delete admin?"
        )
      ) return;

      await supabase
        .from(
          "admin"
        )
        .delete()
        .eq(
          "ad_id",
          id
        );

      fetchAdmins(
        search
      );

    };

  return (

    <div className="
      space-y-8
    ">

      {/* FILTER CARD */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        space-y-5
      ">

        <div className="
          flex
          flex-col
          gap-4
          lg:flex-row
        ">

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target
                  .value
              )
            }
            placeholder="Search admin id..."
            className="
              h-12
              flex-1
              rounded-2xl
              border
              border-border
              bg-background
              px-4
              outline-none
              focus:border-indigo-500
            "
          />

          <button
            onClick={() =>
              fetchAdmins(
                search
              )
            }
            className="
              h-12
              rounded-2xl
              bg-indigo-500
              px-6
              font-semibold
              text-white
            "
          >

            Search

          </button>

          <button
            onClick={() => {

              resetForm();

              setShowAdd(
                true
              );

            }}
            className="
              h-12
              rounded-2xl
              bg-green-600
              px-6
              font-semibold
              text-white
            "
          >

            Add Admin

          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-card
        overflow-hidden
      ">

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-6
          py-5
        ">

          <div>

            <h2 className="
              text-lg
              font-semibold
            ">

              Admin Records

            </h2>

            <p className="
              text-sm
              text-muted-foreground
            ">

              {
                admins.length
              }
              {" "}
              admins found

            </p>

          </div>

        </div>

        {loading ? (

          <div className="
            py-20
            text-center
            text-indigo-500
            font-semibold
          ">

            Loading admins...

          </div>

        ) : admins.length ===
          0 ? (

          <div className="
            py-20
            text-center
            text-muted-foreground
          ">

            No admins found

          </div>

        ) : (

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              text-sm
            ">

              <thead className="
                border-b
                border-border
                bg-muted/20
              ">

                <tr>

                  {[
                    "#",
                    "Admin ID",
                    "Name",
                    "Actions",
                  ].map(
                    (
                      h
                    ) => (

                      <th
                        key={h}
                        className="
                          px-5
                          py-4
                          text-left
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-muted-foreground
                        "
                      >

                        {h}

                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {admins.map(
                  (
                    a: any,
                    idx: number
                  ) => (

                    <tr
                      key={
                        a.ad_id
                      }
                      className="
                        border-b
                        border-border/50
                        hover:bg-muted/20
                      "
                    >

                      <td className="
                        px-5
                        py-4
                      ">

                        {
                          idx + 1
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        <span className="
                          rounded-lg
                          bg-indigo-500/10
                          px-3
                          py-1
                          font-semibold
                          text-indigo-500
                        ">

                          {
                            a.ad_id
                          }

                        </span>

                      </td>

                      <td className="
                        px-5
                        py-4
                        font-medium
                      ">

                        {
                          a.ad_name
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        <div className="
                          flex
                          gap-2
                        ">

                          <button
                            onClick={() => {

                              setEditing(
                                a.ad_id
                              );

                              setForm({
                                ad_id:
                                  a.ad_id,

                                ad_name:
                                  a.ad_name,

                                password:
                                  a.password,
                              });

                              setShowAdd(
                                true
                              );

                            }}
                            className="
                              rounded-xl
                              bg-indigo-500/10
                              px-4
                              py-2
                              text-xs
                              font-semibold
                              text-indigo-500
                            "
                          >

                            Edit

                          </button>

                          <button
                            onClick={() =>
                              deleteAdmin(
                                a.ad_id
                              )
                            }
                            className="
                              rounded-xl
                              bg-red-500/10
                              px-4
                              py-2
                              text-xs
                              font-semibold
                              text-red-500
                            "
                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* MODAL */}

      {showAdd && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/70
          p-4
        ">

          <div className="
            w-full
            max-w-lg
            rounded-3xl
            border
            border-border
            bg-card
            p-8
            space-y-5
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <h2 className="
                text-2xl
                font-bold
              ">

                {
                  editing
                    ? "Edit Admin"
                    : "Add Admin"
                }

              </h2>

              <button
                onClick={() =>
                  setShowAdd(
                    false
                  )
                }
                className="
                  text-muted-foreground
                "
              >

                ✕

              </button>

            </div>

            <div className="
              grid
              gap-4
            ">

              <input
                placeholder="Admin ID"
                value={
                  form.ad_id
                }
                disabled={
                  !!editing
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    ad_id:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

              <input
                placeholder="Admin Name"
                value={
                  form.ad_name
                }
                disabled={
                  !!editing
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    ad_name:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

              <input
                placeholder="Password"
                value={
                  form.password
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

            </div>

            <div className="
              flex
              justify-end
              gap-3
              pt-2
            ">

              <button
                onClick={() =>
                  setShowAdd(
                    false
                  )
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  px-6
                "
              >

                Cancel

              </button>

              <button
                onClick={
                  saveAdmin
                }
                disabled={
                  saving
                }
                className="
                  h-12
                  rounded-2xl
                  bg-indigo-500
                  px-6
                  font-semibold
                  text-white
                  disabled:opacity-50
                "
              >

                {
                  saving

                    ? "Saving..."

                    : editing

                    ? "Save Changes"

                    : "Add Admin"
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}