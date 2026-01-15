"""Admin interface for database management.

Simple Streamlit-based admin panel for viewing and managing users and vaults.
"""

import asyncio
import sys
from datetime import datetime
from pathlib import Path

import streamlit as st
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import async_session_maker, engine
from app.models.database import User, Vault


# Page config
st.set_page_config(
    page_title="Habit Tracker Admin",
    page_icon="🔧",
    layout="wide",
)


async def get_user_count() -> int:
    """Get total number of users."""
    async with async_session_maker() as session:
        result = await session.execute(select(func.count(User.id)))
        return result.scalar() or 0


async def get_vault_count() -> int:
    """Get total number of vaults."""
    async with async_session_maker() as session:
        result = await session.execute(select(func.count(Vault.id)))
        return result.scalar() or 0


async def get_all_users() -> list[User]:
    """Get all users."""
    async with async_session_maker() as session:
        result = await session.execute(select(User).order_by(User.created_at.desc()))
        return list(result.scalars().all())


async def get_user_vaults(user_id: int) -> list[Vault]:
    """Get all vaults for a user."""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Vault).where(Vault.user_id == user_id)
        )
        return list(result.scalars().all())


async def delete_user(user_id: int) -> None:
    """Delete a user and all their vaults."""
    async with async_session_maker() as session:
        # Get user
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")

        # Delete all vaults
        vaults_result = await session.execute(
            select(Vault).where(Vault.user_id == user_id)
        )
        vaults = vaults_result.scalars().all()
        for vault in vaults:
            await session.delete(vault)

        # Delete user
        await session.delete(user)
        await session.commit()


async def delete_all_users() -> int:
    """Delete all users and vaults. Returns count of deleted users."""
    async with async_session_maker() as session:
        # Get all users first to count
        users_result = await session.execute(select(User))
        users = list(users_result.scalars().all())
        count = len(users)

        # Delete all vaults
        vaults_result = await session.execute(select(Vault))
        vaults = vaults_result.scalars().all()
        for vault in vaults:
            await session.delete(vault)

        # Delete all users
        for user in users:
            await session.delete(user)

        await session.commit()
        return count


def run_async(coro):
    """Run async function in Streamlit."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


# Main app
st.title("🔧 Habit Tracker Admin Panel")

# Sidebar for navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select Page", ["Dashboard", "Users", "Delete Records"])

if page == "Dashboard":
    st.header("📊 Statistics")

    col1, col2 = st.columns(2)

    with col1:
        user_count = run_async(get_user_count())
        st.metric("Total Users", user_count)

    with col2:
        vault_count = run_async(get_vault_count())
        st.metric("Total Vaults", vault_count)

    st.divider()

    # Recent activity
    st.subheader("Recent Users")
    users = run_async(get_all_users())
    if users:
        # Show last 10 users
        recent_users = users[:10]
        for user in recent_users:
            vaults = run_async(get_user_vaults(user.id))
            with st.expander(f"👤 {user.username} (ID: {user.id})"):
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write(f"**Created:** {user.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                with col2:
                    st.write(f"**Updated:** {user.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")
                with col3:
                    st.write(f"**Vaults:** {len(vaults)}")
    else:
        st.info("No users found.")

elif page == "Users":
    st.header("👥 User Management")

    users = run_async(get_all_users())

    if not users:
        st.info("No users in the database.")
    else:
        st.write(f"**Total users:** {len(users)}")

        # User selection
        user_options = {f"{u.username} (ID: {u.id})": u.id for u in users}
        selected_user_label = st.selectbox("Select a user to view details:", list(user_options.keys()))

        if selected_user_label:
            selected_user_id = user_options[selected_user_label]
            selected_user = next(u for u in users if u.id == selected_user_id)

            st.divider()
            st.subheader(f"User Details: {selected_user.username}")

            col1, col2 = st.columns(2)
            with col1:
                st.write(f"**User ID:** {selected_user.id}")
                st.write(f"**Username:** {selected_user.username}")
                st.write(f"**Created:** {selected_user.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            with col2:
                st.write(f"**Updated:** {selected_user.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")
                st.write(f"**Salt:** `{selected_user.salt[:20]}...`")

            # Show vaults
            vaults = run_async(get_user_vaults(selected_user.id))
            st.write(f"**Vaults:** {len(vaults)}")
            if vaults:
                for vault in vaults:
                    with st.expander(f"Vault: {vault.vault_id}"):
                        st.write(f"**Version:** {vault.version}")
                        st.write(f"**Created:** {vault.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                        st.write(f"**Updated:** {vault.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")
                        st.write(f"**Ciphertext length:** {len(vault.ciphertext)} chars")

            # Delete button
            st.divider()
            st.subheader("⚠️ Delete User")
            if st.button("Delete This User", type="primary", key="delete_user"):
                if st.session_state.get("confirm_delete") != selected_user_id:
                    st.session_state["confirm_delete"] = selected_user_id
                    st.warning("⚠️ Click again to confirm deletion. This will delete the user and all their vaults!")
                else:
                    try:
                        run_async(delete_user(selected_user_id))
                        st.success(f"✅ User {selected_user.username} and all their vaults deleted successfully!")
                        st.session_state["confirm_delete"] = None
                        st.rerun()
                    except Exception as e:
                        st.error(f"❌ Error deleting user: {str(e)}")

elif page == "Delete Records":
    st.header("🗑️ Delete Records")

    st.warning("⚠️ **Danger Zone** - These operations cannot be undone!")

    # Delete all users
    st.subheader("Delete All Users")
    st.write("This will delete all users and all their vaults from the database.")

    if st.button("Delete All Users", type="primary", key="delete_all"):
        if st.session_state.get("confirm_delete_all") != True:
            st.session_state["confirm_delete_all"] = True
            user_count = run_async(get_user_count())
            st.error(f"⚠️ **WARNING:** This will delete {user_count} users and all their vaults! Click again to confirm.")
        else:
            try:
                deleted_count = run_async(delete_all_users())
                st.success(f"✅ Deleted {deleted_count} users and all their vaults!")
                st.session_state["confirm_delete_all"] = None
                st.rerun()
            except Exception as e:
                st.error(f"❌ Error deleting users: {str(e)}")

    st.divider()

    # Database info
    st.subheader("Database Information")
    user_count = run_async(get_user_count())
    vault_count = run_async(get_vault_count())
    st.write(f"- **Users:** {user_count}")
    st.write(f"- **Vaults:** {vault_count}")

# Footer
st.divider()
st.caption(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


